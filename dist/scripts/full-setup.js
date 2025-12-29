"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Domain_1 = require("../entities/Domain");
const Project_1 = require("../entities/Project");
const Keyword_1 = require("../entities/Keyword");
const SearchEngine_1 = require("../entities/SearchEngine");
async function runMigrations() {
    console.log('\n📦 Running migrations...');
    try {
        const migrations = await data_source_1.AppDataSource.runMigrations();
        if (migrations.length > 0) {
            console.log('✅ Migrations executed:', migrations.map(m => m.name).join(', '));
        }
        else {
            console.log('✅ Migrations up to date');
        }
    }
    catch (err) {
        if (err.message?.includes('already exists')) {
            console.log('✅ Tables already exist, skipping migrations');
        }
        else {
            throw err;
        }
    }
}
async function seedSearchEngines() {
    console.log('\n🔍 Seeding search engines...');
    const seRepo = data_source_1.AppDataSource.getRepository(SearchEngine_1.SearchEngine);
    const engines = await seRepo.find();
    if (engines.length === 0) {
        const googleData = { name: 'Google', domain: 'google.com', search_url_pattern: 'https://www.google.com/search?q={query}' };
        const google = await seRepo.save(googleData);
        console.log('✅ Created search engine:', google.name);
    }
    else {
        console.log('✅ Search engines already exist');
    }
}
async function seedSampleDomains() {
    console.log('\n🌐 Seeding sample domains...');
    const dRepo = data_source_1.AppDataSource.getRepository(Domain_1.Domain);
    const domains = [
        { host: 'example.com', canonical_url: 'https://example.com' },
        { host: 'sample-site.ir', canonical_url: 'https://sample-site.ir' }
    ];
    for (const domainData of domains) {
        const existing = await dRepo.findOne({ where: { host: domainData.host } });
        if (!existing) {
            const domain = await dRepo.save(domainData);
            console.log('✅ Created domain:', domain.host);
        }
    }
}
async function bootstrapDigikala() {
    console.log('\n🛍️  Bootstrapping Digikala...');
    const domainRepo = data_source_1.AppDataSource.getRepository(Domain_1.Domain);
    const projectRepo = data_source_1.AppDataSource.getRepository(Project_1.Project);
    const kwRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
    // Ensure domain exists
    let domain = await domainRepo.findOne({ where: { host: 'digikala.ir' } });
    if (!domain) {
        const created = await domainRepo.save({ host: 'digikala.ir', canonical_url: 'https://www.digikala.com' });
        domain = created;
        console.log('✅ Created domain:', domain.id, domain.host);
    }
    else {
        console.log('ℹ️  Domain already exists:', domain.host);
    }
    // Create project
    let project = await projectRepo.findOne({ where: { domain: { id: domain.id } } });
    if (!project) {
        project = await projectRepo.save({ name: 'Digikala Tracker', domain: domain });
        console.log('✅ Created project:', project.id, project.name);
    }
    else {
        console.log('ℹ️  Project already exists:', project.name);
    }
    // Keywords to add
    const keywords = [
        'خرید لپ تاپ',
        'قیمت گوشی سامسونگ',
        'قیمت تلویزیون',
        'خرید موبایل',
        'خرید هدفون'
    ];
    let addedCount = 0;
    for (const k of keywords) {
        const exists = await kwRepo.findOne({ where: { project_id: project.id, normalized_keyword: k.toLowerCase() } });
        if (!exists) {
            const saved = await kwRepo.save({ project_id: project.id, keyword: k, normalized_keyword: k.toLowerCase(), language: 'fa' });
            addedCount++;
            console.log('✅ Added keyword:', saved.keyword);
        }
    }
    if (addedCount === 0) {
        console.log('ℹ️  All keywords already exist');
    }
    return { domainId: domain.id, projectId: project.id };
}
async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 Full Setup: Database + Seeds + Digikala Bootstrap');
    console.log('═══════════════════════════════════════════════════════════════');
    try {
        console.log('\n🔌 Initializing database...');
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            console.log('✅ Database initialized');
        }
        // Run all setup steps
        await runMigrations();
        await seedSearchEngines();
        await seedSampleDomains();
        const { domainId, projectId } = await bootstrapDigikala();
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('✅ SETUP COMPLETE!');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('\n📋 Summary:');
        console.log('  ✓ Migrations applied');
        console.log('  ✓ Search engines seeded');
        console.log('  ✓ Sample domains created');
        console.log('  ✓ Digikala domain & project ready');
        console.log('\n🎯 Your Digikala Setup:');
        console.log('  Domain ID:  ', domainId);
        console.log('  Project ID: ', projectId);
        console.log('\n🚀 Next Steps:');
        console.log('  1. Terminal 1: npm run dev              (start API server)');
        console.log('  2. Terminal 2: npm run scheduler:start  (start scheduler)');
        console.log('  3. Terminal 3: npm run worker:start     (start worker)');
        console.log('\n📚 Test with curl:');
        console.log('  curl http://localhost:3000/api/projects');
        console.log('\n═══════════════════════════════════════════════════════════════\n');
        process.exit(0);
    }
    catch (err) {
        console.error('\n❌ Setup failed:', err);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
    }
}
main();
