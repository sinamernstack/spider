"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Domain_1 = require("../entities/Domain");
const Project_1 = require("../entities/Project");
const Keyword_1 = require("../entities/Keyword");
const RankCheck_1 = require("../entities/RankCheck");
async function run() {
    try {
        console.log('Bootstrap: digikala — initializing DB...');
        if (!data_source_1.AppDataSource.isInitialized)
            await data_source_1.AppDataSource.initialize();
        const domainRepo = data_source_1.AppDataSource.getRepository(Domain_1.Domain);
        const projectRepo = data_source_1.AppDataSource.getRepository(Project_1.Project);
        const kwRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
        const rcRepo = data_source_1.AppDataSource.getRepository(RankCheck_1.RankCheck);
        // Ensure domain exists
        let domain = await domainRepo.findOne({ where: { host: 'digikala.ir' } });
        if (!domain) {
            const created = await domainRepo.save({ host: 'digikala.ir', canonical_url: 'https://www.digikala.ir' });
            domain = created;
            console.log('Created domain:', domain.id, domain.host);
        }
        else {
            console.log('Found existing domain:', domain.id, domain.host);
        }
        // Create project
        let project = await projectRepo.save({ name: 'Digikala Tracker', domain: domain });
        console.log('Created project:', project.id, project.name);
        // Keywords to add
        const keywords = [
            'خرید لپ تاپ',
            'قیمت گوشی سامسونگ',
            'قیمت تلویزیون',
            'خرید موبایل',
            'خرید هدفون'
        ];
        const addedKeywords = [];
        for (const k of keywords) {
            const exists = await kwRepo.findOne({ where: { project_id: project.id, normalized_keyword: k.toLowerCase() } });
            if (exists) {
                addedKeywords.push(exists);
                continue;
            }
            const saved = await kwRepo.save({ project_id: project.id, keyword: k, normalized_keyword: k.toLowerCase(), language: 'fa' });
            addedKeywords.push(saved);
            console.log('Added keyword:', saved.id, saved.keyword);
        }
        // Schedule an immediate rank check
        const savedRc = await rcRepo.save({ project_id: project.id, scheduled_at: new Date() });
        console.log('Created rank_check:', savedRc.id, 'for project', project.id);
        console.log('\nSummary:');
        console.log('  domain_id:', domain.id);
        console.log('  project_id:', project.id);
        console.log('  keyword_ids:', addedKeywords.map(k => k.id).join(', '));
        console.log('  rank_check_id:', savedRc.id);
        process.exit(0);
    }
    catch (err) {
        console.error('Bootstrap failed:', err);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized)
            await data_source_1.AppDataSource.destroy();
    }
}
run();
