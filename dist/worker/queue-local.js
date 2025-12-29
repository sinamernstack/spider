"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankQueue = void 0;
exports.startWorker = startWorker;
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("../data-source");
const RankResult_1 = require("../entities/RankResult");
const SerpSnapshot_1 = require("../entities/SerpSnapshot");
const fetcher_1 = __importDefault(require("./fetcher"));
const limiter_1 = __importDefault(require("./limiter"));
dotenv_1.default.config();
// In-memory job queue for development
const jobQueue = [];
let isProcessing = false;
async function processJob(data) {
    console.log(`⏳ Processing job: keyword="${data.keyword_text}", device="${data.device}"`);
    const domainKey = `${data.target_domain || data.project_domain}:${data.search_engine}:${data.device}`;
    const allowed = await limiter_1.default.acquireSlot(domainKey, data.limit_per_domain || 2, data.limit_window_sec || 60);
    if (!allowed) {
        console.warn('  ⚠️ Rate limited for', domainKey);
        throw new Error('RATE_LIMITED');
    }
    // Fetch SERP
    const results = await (0, fetcher_1.default)(data.keyword_text, { language: data.language, ua: data.ua, proxy: data.proxy });
    // Ensure DB initialized
    if (!data_source_1.AppDataSource.isInitialized)
        await data_source_1.AppDataSource.initialize();
    const rrRepo = data_source_1.AppDataSource.getRepository(RankResult_1.RankResult);
    const ssRepo = data_source_1.AppDataSource.getRepository(SerpSnapshot_1.SerpSnapshot);
    // Store snapshot
    try {
        await ssRepo.save({
            rank_check_id: data.rank_check_id,
            keyword_id: data.keyword_id,
            search_engine_id: undefined,
            country: data.country,
            language: data.language,
            snapshot_json: { raw: results },
            snapshot_hash: undefined
        });
    }
    catch (err) {
        console.warn('  ⚠️ Failed to save snapshot', err);
    }
    // Persist results
    let savedCount = 0;
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
            savedCount++;
        }
        catch (err) {
            console.warn('  ⚠️ Failed to save rank result', err);
        }
    }
    console.log(`  ✅ Processed: ${savedCount} results saved`);
    return { ok: true, count: results.length };
}
// Poll job queue every 5 seconds
async function pollQueue() {
    setInterval(async () => {
        if (isProcessing || jobQueue.length === 0)
            return;
        isProcessing = true;
        while (jobQueue.length > 0) {
            const job = jobQueue.shift();
            try {
                await processJob(job);
            }
            catch (err) {
                console.error(`  ❌ Job failed:`, err.message);
            }
            // Small delay between jobs
            await new Promise(r => setTimeout(r, 2000));
        }
        isProcessing = false;
    }, 5000);
}
exports.rankQueue = {
    add: async (name, data, options) => {
        console.log(`📌 Job added to queue: ${name}`, {
            keyword: data.keyword_text,
            device: data.device,
        });
        jobQueue.push(data);
    },
};
async function startWorker() {
    console.log('🚀 Worker started (in-memory mode, no Redis required)');
    console.log('📋 Watching job queue...\n');
    if (!data_source_1.AppDataSource.isInitialized)
        await data_source_1.AppDataSource.initialize();
    // Start polling
    pollQueue();
    // Keep process alive
    process.on('SIGINT', () => {
        console.log('\n🛑 Worker stopped');
        process.exit(0);
    });
}
// If this file is executed directly, start the worker
if (require.main === module) {
    startWorker().catch(err => {
        console.error('❌ Failed to start worker', err);
        process.exit(1);
    });
}
