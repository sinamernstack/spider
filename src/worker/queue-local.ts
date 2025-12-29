import dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { RankResult } from '../entities/RankResult';
import { SerpSnapshot } from '../entities/SerpSnapshot';
import fetchSERP from './fetcher';
import limiter from './limiter';

dotenv.config();

// In-memory job queue for development
const jobQueue: any[] = [];
let isProcessing = false;

async function processJob(data: any) {
  console.log(`⏳ Processing job: keyword="${data.keyword_text}", device="${data.device}"`);

  const domainKey = `${data.target_domain || data.project_domain}:${data.search_engine}:${data.device}`;
  const allowed = await limiter.acquireSlot(domainKey, data.limit_per_domain || 2, data.limit_window_sec || 60);
  if (!allowed) {
    console.warn('  ⚠️ Rate limited for', domainKey);
    throw new Error('RATE_LIMITED');
  }

  // Fetch SERP
  const results = await fetchSERP(data.keyword_text, { language: data.language, ua: data.ua, proxy: data.proxy });

  // Ensure DB initialized
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const rrRepo = AppDataSource.getRepository(RankResult);
  const ssRepo = AppDataSource.getRepository(SerpSnapshot);

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
    } as any);
  } catch (err) {
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
      } as any);
      savedCount++;
    } catch (err) {
      console.warn('  ⚠️ Failed to save rank result', err);
    }
  }

  console.log(`  ✅ Processed: ${savedCount} results saved`);
  return { ok: true, count: results.length };
}

// Poll job queue every 5 seconds
async function pollQueue() {
  setInterval(async () => {
    if (isProcessing || jobQueue.length === 0) return;

    isProcessing = true;
    while (jobQueue.length > 0) {
      const job = jobQueue.shift();
      try {
        await processJob(job);
      } catch (err: any) {
        console.error(`  ❌ Job failed:`, err.message);
      }
      // Small delay between jobs
      await new Promise(r => setTimeout(r, 2000));
    }
    isProcessing = false;
  }, 5000);
}

export const rankQueue = {
  add: async (name: string, data: any, options?: any) => {
    console.log(`📌 Job added to queue: ${name}`, {
      keyword: data.keyword_text,
      device: data.device,
    });
    jobQueue.push(data);
  },
};

export async function startWorker() {
  console.log('🚀 Worker started (in-memory mode, no Redis required)');
  console.log('📋 Watching job queue...\n');

  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

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
