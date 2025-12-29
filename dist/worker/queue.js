"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deadLetterQueue = exports.rankQueue = void 0;
exports.startWorker = startWorker;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const limiter_1 = __importDefault(require("./limiter"));
const data_source_1 = require("../data-source");
const RankResult_1 = require("../entities/RankResult");
const SerpSnapshot_1 = require("../entities/SerpSnapshot");
const fetcher_1 = __importDefault(require("./fetcher"));
dotenv_1.default.config();
const connection = new ioredis_1.default({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
});
exports.rankQueue = new bullmq_1.Queue('rank-checks', { connection });
exports.deadLetterQueue = new bullmq_1.Queue('rank-checks-dlq', { connection });
async function processJob(job) {
    const data = job.data;
    console.log('Worker processing', job.id, data.project_id, data.keyword_id, data.keyword_text);
    const domainKey = `${data.target_domain || data.project_domain}:${data.search_engine}:${data.device}`;
    const allowed = await limiter_1.default.acquireSlot(domainKey, data.limit_per_domain || 2, data.limit_window_sec || 60);
    if (!allowed) {
        console.warn('Rate limited for', domainKey);
        throw new Error('RATE_LIMITED');
    }
    // fetch SERP via provider or direct parse
    const results = await (0, fetcher_1.default)(data.keyword_text, { language: data.language, ua: data.ua, proxy: data.proxy });
    // ensure DB initialized
    if (!data_source_1.AppDataSource.isInitialized)
        await data_source_1.AppDataSource.initialize();
    const rrRepo = data_source_1.AppDataSource.getRepository(RankResult_1.RankResult);
    const ssRepo = data_source_1.AppDataSource.getRepository(SerpSnapshot_1.SerpSnapshot);
    // store snapshot
    try {
        await ssRepo.save({ rank_check_id: data.rank_check_id, keyword_id: data.keyword_id, search_engine_id: undefined, country: data.country, language: data.language, snapshot_json: { raw: results }, snapshot_hash: undefined });
    }
    catch (err) {
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
            });
        }
        catch (err) {
            console.warn('Failed to save rank result', err);
        }
    }
    return { ok: true, count: results.length };
}
async function startWorker() {
    if (!data_source_1.AppDataSource.isInitialized)
        await data_source_1.AppDataSource.initialize();
    const worker = new bullmq_1.Worker('rank-checks', async (job) => processJob(job), { connection, concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10) });
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
