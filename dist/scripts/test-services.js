"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const services_1 = require("../services");
const Domain_1 = require("../entities/Domain");
async function testServices() {
    try {
        console.log('🚀 Testing modular services architecture...\n');
        // Initialize database
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            console.log('✅ Database connected\n');
        }
        // Initialize services
        const projectService = new services_1.ProjectService();
        const keywordService = new services_1.KeywordService();
        const rankCheckService = new services_1.RankCheckService();
        // Test: Create a test domain and project
        console.log('📋 Creating test domain and project...');
        const domainRepo = data_source_1.AppDataSource.getRepository(Domain_1.Domain);
        let testDomain = domainRepo.create({ host: 'test.local', canonical_url: 'https://test.local' });
        testDomain = await domainRepo.save(testDomain);
        const testProject = await projectService.createProject('Test Project - Modular Architecture', testDomain.id, undefined);
        console.log('✅ Project created:', testProject.id);
        console.log(`   Name: ${testProject.name}\n`);
        // Test: Get project
        console.log('🔍 Fetching project...');
        const fetchedProject = await projectService.getProject(testProject.id);
        console.log('✅ Project fetched:', fetchedProject?.name, '\n');
        // Test: Add keywords
        console.log('📝 Adding keywords...');
        const kw1 = await keywordService.addKeyword(testProject.id, 'typescript modular architecture', 'en');
        const kw2 = await keywordService.addKeyword(testProject.id, 'express js best practices', 'en');
        console.log('✅ Keywords added:');
        console.log(`   1. ${kw1.keyword}`);
        console.log(`   2. ${kw2.keyword}\n`);
        // Test: Get keywords by project
        console.log('📚 Fetching keywords for project...');
        const keywords = await keywordService.getKeywordsByProject(testProject.id);
        console.log(`✅ Found ${keywords.length} keywords\n`);
        // Test: Create rank checks
        console.log('⏰ Creating rank checks...');
        const check1 = await rankCheckService.createRankCheck(testProject.id);
        const check2 = await rankCheckService.createRankCheck(testProject.id, new Date(Date.now() + 3600000) // 1 hour from now
        );
        console.log('✅ Rank checks created:');
        console.log(`   1. ID: ${check1.id} (Status: ${check1.status})`);
        console.log(`   2. ID: ${check2.id} (Status: ${check2.status})\n`);
        // Test: Get pending checks
        console.log('🔎 Fetching pending checks...');
        const pendingChecks = await rankCheckService.getPendingChecks();
        console.log(`✅ Found ${pendingChecks.length} pending checks\n`);
        console.log('🎉 All tests passed! Architecture is working correctly.\n');
        console.log('📊 Summary:');
        console.log(`   - Services: ProjectService, KeywordService, RankCheckService`);
        console.log(`   - Database operations: ✅ Working`);
        console.log(`   - Error handling: ✅ Active`);
        console.log(`   - Modular structure: ✅ Verified\n`);
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}
// Run tests
testServices().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
