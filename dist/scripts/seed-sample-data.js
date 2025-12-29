"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Domain_1 = require("../entities/Domain");
const Project_1 = require("../entities/Project");
const ProjectSettings_1 = require("../entities/ProjectSettings");
const Keyword_1 = require("../entities/Keyword");
const Competitor_1 = require("../entities/Competitor");
const RankCheck_1 = require("../entities/RankCheck");
async function seed() {
    try {
        await data_source_1.AppDataSource.initialize();
        const domainRepo = data_source_1.AppDataSource.getRepository(Domain_1.Domain);
        const projectRepo = data_source_1.AppDataSource.getRepository(Project_1.Project);
        const psRepo = data_source_1.AppDataSource.getRepository(ProjectSettings_1.ProjectSettings);
        const kwRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
        const compRepo = data_source_1.AppDataSource.getRepository(Competitor_1.Competitor);
        const rcRepo = data_source_1.AppDataSource.getRepository(RankCheck_1.RankCheck);
        // Sample projects (3)
        const samples = [
            { name: 'Example Store', host: 'examplestore.test', keywords: ['red shoes', 'blue jacket'] },
            { name: 'Tech Blog', host: 'techblog.test', keywords: ['nodejs performance', 'postgres partitioning'] },
            { name: 'Local Cafe', host: 'localcafe.test', keywords: ['best coffee near me', 'cafe brunch'] },
        ];
        for (const s of samples) {
            let d = await domainRepo.findOne({ where: { host: s.host } });
            if (!d)
                d = domainRepo.create({ host: s.host, canonical_url: `https://${s.host}` });
            d = await domainRepo.save(d);
            let p = projectRepo.create({ name: s.name, domain: d });
            p = await projectRepo.save(p);
            await psRepo.save({ project_id: p.id, default_country: 'US', default_language: 'en-US', check_frequency_minutes: 1440 });
            for (const k of s.keywords) {
                await kwRepo.save({ project_id: p.id, keyword: k, normalized_keyword: k.toLowerCase() });
            }
            // add a dummy competitor
            const compDomain = `${s.host.replace('.', '')}-competitor.test`;
            let cd = await domainRepo.findOne({ where: { host: compDomain } });
            if (!cd)
                cd = domainRepo.create({ host: compDomain, canonical_url: `https://${compDomain}` });
            cd = await domainRepo.save(cd);
            await compRepo.save({ project_id: p.id, domain_id: cd.id, label: 'Competitor 1' });
            // schedule an immediate rank_check
            const rc = rcRepo.create({ project_id: p.id, scheduled_at: new Date() });
            await rcRepo.save(rc);
        }
        console.log('Seeding complete');
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (err) {
        console.error('Seeding failed', err);
        process.exit(1);
    }
}
seed();
seed();
