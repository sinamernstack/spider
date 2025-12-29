"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Project_1 = require("../entities/Project");
const Domain_1 = require("../entities/Domain");
const Keyword_1 = require("../entities/Keyword");
const RankResult_1 = require("../entities/RankResult");
const validators_1 = require("../middleware/validators");
const projectController_1 = require("../controllers/projectController");
const router = (0, express_1.Router)();
// GET /api/projects
router.get('/projects', async (_req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(Project_1.Project);
    const projects = await repo.find({ relations: ['domain'] });
    res.json(projects);
});
// POST /api/projects
router.post('/projects', async (req, res) => {
    try {
        const { name, domain_host, domain_id } = req.body;
        if (!name)
            return res.status(400).json({ error: 'name required' });
        if (!domain_host && !domain_id)
            return res.status(400).json({ error: 'domain_host or domain_id required' });
        const dRepo = data_source_1.AppDataSource.getRepository(Domain_1.Domain);
        let domain = null;
        // Try to find by host if domain_host is provided
        if (domain_host) {
            domain = await dRepo.findOne({ where: { host: domain_host } });
        }
        // Otherwise try domain_id
        if (!domain && domain_id) {
            domain = await dRepo.findOne({ where: { id: domain_id } });
        }
        // If still not found and domain_host provided, create it
        if (!domain && domain_host) {
            domain = await dRepo.save({ host: domain_host });
        }
        if (!domain) {
            return res.status(400).json({ error: 'Cannot find or create domain' });
        }
        const pRepo = data_source_1.AppDataSource.getRepository(Project_1.Project);
        const project = await pRepo.save({ name, domain });
        res.status(201).json(project);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
// GET /api/projects/:projectId/keywords
router.get('/projects/:projectId/keywords', validators_1.validateProjectId, async (req, res) => {
    const kwRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
    const kws = await kwRepo.find({ where: { project_id: req.params.projectId } });
    res.json(kws);
});
// POST /api/projects/:projectId/keywords
router.post('/projects/:projectId/keywords', validators_1.validateProjectId, validators_1.validateAddKeyword, async (req, res) => {
    const { keyword } = req.body;
    if (!keyword)
        return res.status(400).json({ error: 'keyword required' });
    const kwRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
    const saved = await kwRepo.save({ project_id: req.params.projectId, keyword, normalized_keyword: keyword.toLowerCase(), language: 'fa' });
    res.status(201).json(saved);
});
// POST /api/projects/:projectId/checks
router.post('/projects/:projectId/checks', validators_1.validateProjectId, validators_1.validateCreateRankCheck, projectController_1.createRankCheck);
// GET /api/projects/:projectId/keywords/:keywordId/ranks
router.get('/projects/:projectId/keywords/:keywordId/ranks', validators_1.validateProjectId, validators_1.validateKeywordId, projectController_1.getKeywordRanks);
// GET /api/results
router.get('/results', async (req, res) => {
    const rrRepo = data_source_1.AppDataSource.getRepository(RankResult_1.RankResult);
    const projectId = req.query.project_id;
    const limit = parseInt(req.query.limit || '50', 10);
    const where = {};
    if (projectId)
        where.project_id = projectId;
    const results = await rrRepo.find({ where, order: { checked_at: 'DESC' }, take: limit });
    res.json(results);
});
exports.default = router;
