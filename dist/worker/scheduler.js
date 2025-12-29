"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("./queue");
const cron_1 = __importDefault(require("cron"));
const data_source_1 = require("../data-source");
const RankCheck_1 = require("../entities/RankCheck");
const Keyword_1 = require("../entities/Keyword");
const jobId_1 = __importDefault(require("../utils/jobId"));
// Schedule example: every minute (for demo). In production tune cron expression.
const job = new cron_1.default.CronJob('0 * * * * *', async () => {
    console.log('Scheduler: scanning for due rank_checks');
    if (!data_source_1.AppDataSource.isInitialized)
        await data_source_1.AppDataSource.initialize();
    const rcRepo = data_source_1.AppDataSource.getRepository(RankCheck_1.RankCheck);
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
            const kwRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
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
                };
                const jobId = (0, jobId_1.default)({ project_id: payload.project_id, keyword_id: payload.keyword_id, device: payload.device, search_engine: payload.search_engine, date: new Date().toISOString().slice(0, 10) });
                await queue_1.rankQueue.add('keyword-check', payload, {
                    jobId,
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 3000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                });
            }
            rc.status = 2; // finished/enqueued
            await rcRepo.save(rc);
        }
        catch (err) {
            console.error('Error enqueueing for rank_check', rc.id, err);
            rc.status = 3;
            await rcRepo.save(rc);
        }
    }
});
job.start();
console.log('Scheduler started');
process.on('SIGINT', () => job.stop());
