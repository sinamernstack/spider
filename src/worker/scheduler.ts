import { rankQueue } from './queue';
import cron from 'cron';
import { AppDataSource } from '../data-source';
import { RankCheck } from '../entities/RankCheck';
import { Keyword } from '../entities/Keyword';
import makeJobId from '../utils/jobId';

// Schedule example: every minute (for demo). In production tune cron expression.
const job = new cron.CronJob('0 * * * * *', async () => {
  console.log('Scheduler: scanning for due rank_checks');
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  const rcRepo = AppDataSource.getRepository(RankCheck);
  const due = await rcRepo.createQueryBuilder('rc')
    .where('rc.scheduled_at <= :now', { now: new Date() })
    .andWhere('rc.status = :s', { s: 0 })
    .getMany();

  for (const rc of due) {
    try {
      // mark running to avoid double-enqueue
      rc.status = 1;
      await rcRepo.save(rc);

      // load keywords for project
      const kwRepo = AppDataSource.getRepository(Keyword);
      const keywords = await kwRepo.find({ where: { project_id: rc.project_id } });

      for (const kw of keywords) {
        const payload = {
          rank_check_id: rc.id,
          project_id: rc.project_id,
          keyword_id: kw.id,
          keyword_text: kw.keyword,
          device: 'mobile',
          search_engine: 'google.com',
          project_domain: undefined,
          target_domain: undefined,
          scheduled_at: rc.scheduled_at,
          limit_per_domain: 2,
          limit_window_sec: 60,
        } as any;

        const jobId = makeJobId({ project_id: payload.project_id, keyword_id: payload.keyword_id, device: payload.device, search_engine: payload.search_engine, date: new Date().toISOString().slice(0,10) });

        await rankQueue.add('keyword-check', payload, {
          jobId,
          attempts: 5,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
          removeOnFail: false,
        });
      }

      rc.status = 2; // finished/enqueued
      await rcRepo.save(rc);
    } catch (err) {
      console.error('Error enqueueing for rank_check', rc.id, err);
      rc.status = 3;
      await rcRepo.save(rc);
    }
  }
});

job.start();

console.log('Scheduler started');

process.on('SIGINT', () => job.stop());
