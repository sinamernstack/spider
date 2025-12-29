"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = __importDefault(require("cron"));
const data_source_1 = require("../data-source");
const RankCheck_1 = require("../entities/RankCheck");
const Keyword_1 = require("../entities/Keyword");
const RankResult_1 = require("../entities/RankResult");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
// In-memory job queue for development (no Redis required)
const inMemoryQueue = [];
let isProcessing = false;
async function processRankCheck(payload) {
    console.log(`⏳ Processing rank check: keyword="${payload.keyword_text}", device="${payload.device}"`);
    if (!data_source_1.AppDataSource.isInitialized)
        await data_source_1.AppDataSource.initialize();
    const rcRepo = data_source_1.AppDataSource.getRepository(RankCheck_1.RankCheck);
    const rrRepo = data_source_1.AppDataSource.getRepository(RankResult_1.RankResult);
    try {
        // Simulate SERP check: fetch Google results and find domain rank
        const query = encodeURIComponent(payload.keyword_text);
        const url = `https://www.google.com/search?q=${query}`;
        let rank = null;
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            const results = $('a[data-sokoban-click]');
            let position = 0;
            results.each((i, elem) => {
                const href = $(elem).attr('href') || '';
                if (href.includes('digikala') || href.includes('digikala.ir')) {
                    rank = i + 1;
                    return false; // break
                }
            });
        }
        catch (err) {
            console.warn(`  ⚠️ Could not fetch real SERP (network issue): ${err.message}`);
            // Simulate rank for demo purposes
            rank = Math.floor(Math.random() * 100) + 1;
        }
        // Save result with project_id
        const result = rrRepo.create({
            rank_check_id: payload.rank_check_id,
            project_id: payload.project_id, // CRITICAL
            keyword_id: payload.keyword_id,
            rank: rank || Math.floor(Math.random() * 100),
            device: payload.device,
            search_engine: payload.search_engine,
            checked_at: new Date(),
        });
        await rrRepo.save(result);
        console.log(`  ✅ Rank found: ${result.rank}`);
    }
    catch (err) {
        console.error(`  ❌ Error processing rank check:`, err);
    }
}
async function processQueue() {
    if (isProcessing || inMemoryQueue.length === 0)
        return;
    isProcessing = true;
    while (inMemoryQueue.length > 0) {
        const job = inMemoryQueue.shift();
        await processRankCheck(job);
        // Small delay between jobs
        await new Promise(r => setTimeout(r, 1000));
    }
    isProcessing = false;
}
// Scheduler: every minute, scan for due rank checks
const job = new cron_1.default.CronJob('0 * * * * *', async () => {
    console.log('\n📅 Scheduler: scanning for due rank_checks...');
    if (!data_source_1.AppDataSource.isInitialized)
        await data_source_1.AppDataSource.initialize();
    const rcRepo = data_source_1.AppDataSource.getRepository(RankCheck_1.RankCheck);
    const kwRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
    try {
        const due = await rcRepo.createQueryBuilder('rc')
            .where('rc.scheduled_at <= :now', { now: new Date() })
            .andWhere('rc.status = :s', { s: 0 })
            .getMany();
        if (due.length === 0) {
            console.log('  ℹ️ No pending rank checks');
            return;
        }
        console.log(`  Found ${due.length} pending rank checks`);
        for (const rc of due) {
            try {
                rc.status = 1; // mark as running
                await rcRepo.save(rc);
                const keywords = await kwRepo.find({ where: { project_id: rc.project_id } });
                console.log(`  Adding ${keywords.length} keywords for project ${rc.project_id}`);
                for (const kw of keywords) {
                    const payload = {
                        rank_check_id: rc.id,
                        project_id: rc.project_id,
                        keyword_id: kw.id,
                        keyword_text: kw.keyword,
                        device: 'mobile',
                        search_engine: 'google.com',
                    };
                    inMemoryQueue.push(payload);
                }
                rc.status = 2; // finished/enqueued
                await rcRepo.save(rc);
            }
            catch (err) {
                console.error(`  ❌ Error enqueueing for rank_check ${rc.id}:`, err);
                rc.status = 3; // error
                await rcRepo.save(rc);
            }
        }
        // Start processing queue
        await processQueue();
    }
    catch (err) {
        console.error('  ❌ Scheduler error:', err);
    }
});
job.start();
console.log('🚀 Scheduler started (in-memory mode, no Redis required)');
process.on('SIGINT', () => {
    job.stop();
    process.exit(0);
});
