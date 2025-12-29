"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const RankResult_1 = require("../entities/RankResult");
const SerpSnapshot_1 = require("../entities/SerpSnapshot");
async function main() {
    try {
        if (!data_source_1.AppDataSource.isInitialized)
            await data_source_1.AppDataSource.initialize();
        const rrRepo = data_source_1.AppDataSource.getRepository(RankResult_1.RankResult);
        const ssRepo = data_source_1.AppDataSource.getRepository(SerpSnapshot_1.SerpSnapshot);
        console.log('Fetching last 20 rank_result rows...');
        const results = await rrRepo.find({ order: { checked_at: 'DESC' }, take: 20 });
        console.log(`Found ${results.length} rank_result rows`);
        for (const r of results) {
            console.log(`- id=${r.id} project=${r.project_id} keyword=${r.keyword_id} rank=${r.rank ?? r.position} checked_at=${r.checked_at}`);
        }
        console.log('\nFetching last 10 serp_snapshot rows...');
        const snaps = await ssRepo.find({ order: { id: 'DESC' }, take: 10 });
        console.log(`Found ${snaps.length} serp_snapshot rows`);
        for (const s of snaps) {
            console.log(`- id=${s.id} rank_check_id=${s.rank_check_id} keyword_id=${s.keyword_id} snapshot_keys=${s.snapshot_json ? Object.keys(s.snapshot_json).join(',') : 'n/a'}`);
        }
        process.exit(0);
    }
    catch (err) {
        console.error('Error checking results:', err);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized)
            await data_source_1.AppDataSource.destroy();
    }
}
main();
