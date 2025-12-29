import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import limiter from './limiter';
import { AppDataSource } from '../data-source';
import { RankResult } from '../entities/RankResult';
import { SerpSnapshot } from '../entities/SerpSnapshot';
import fetchSERP from './fetcher';

dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

export const rankQueue = new Queue('rank-checks', { connection });
export const deadLetterQueue = new Queue('rank-checks-dlq', { connection });

async function processJob(job: Job) {
  const data = job.data as any;
  console.log('Worker processing', job.id, data.project_id, data.keyword_id, data.keyword_text);

  const domainKey = `${data.target_domain || data.project_domain}:${data.search_engine}:${data.device}`;
  const allowed = await limiter.acquireSlot(domainKey, data.limit_per_domain || 2, data.limit_window_sec || 60);
  if (!allowed) {
    console.warn('Rate limited for', domainKey);
    throw new Error('RATE_LIMITED');
  }

  // fetch SERP via provider or direct parse
  const results = await fetchSERP(data.keyword_text, { language: data.language, ua: data.ua, proxy: data.proxy });

  // ensure DB initialized
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const rrRepo = AppDataSource.getRepository(RankResult);
  const ssRepo = AppDataSource.getRepository(SerpSnapshot);

  // store snapshot
  try {
    await ssRepo.save({ rank_check_id: data.rank_check_id, keyword_id: data.keyword_id, search_engine_id: undefined, country: data.country, language: data.language, snapshot_json: { raw: results }, snapshot_hash: undefined });
  } catch (err) {
    console.warn('Failed to save snapshot', err);
  }

  // persist top results
  for (const r of results) {
    try {
      await rrRepo.save({
        rank_check_id: data.rank_check_id,
        project_id: data.project_id,
        keyword_id: data.keyword_id,
        competitor_id: null,
        domain_id: null,
        search_engine_id: null,
        country: data.country,
        language: data.language,
        position: r.position,
        result_url: r.url,
        result_title: r.title,
        result_snippet: r.snippet,
        is_featured_snippet: false,
        is_ad: !!r.is_ad,
        raw_rank_data: r,
        checked_at: new Date(),
      } as any);
    } catch (err) {
      console.warn('Failed to save rank result', err);
    }
  }

  return { ok: true, count: results.length };
}

export async function startWorker() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const worker = new Worker('rank-checks', async (job: Job) => processJob(job), { connection, concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10) });

  worker.on('failed', async (job, err) => {
    console.error('Job failed', job?.id, err?.message || err);
  });

  worker.on('completed', job => {
    console.log('Job completed', job.id);
  });

  console.log('Worker started');
}

// If this file is executed directly, start the worker
if (require.main === module) {
  startWorker().catch(err => {
    console.error('Failed to start worker', err);
    process.exit(1);
  });
}

