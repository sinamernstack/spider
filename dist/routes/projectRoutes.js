"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const validators_1 = require("../middleware/validators");
const data_source_1 = require("../data-source");
const Project_1 = require("../entities/Project");
const router = (0, express_1.Router)();
/**
 * GET /projects
 * List all projects
 */
router.get('/', async (_req, res) => {
    try {
        if (!data_source_1.AppDataSource.isInitialized)
            await data_source_1.AppDataSource.initialize();
        const projectRepo = data_source_1.AppDataSource.getRepository(Project_1.Project);
        const projects = await projectRepo.find({ relations: ['domain'] });
        res.json(projects);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
/**
 * POST /projects
 * Create a new project
 */
router.post('/', validators_1.validateCreateProject, projectController_1.createProject);
/**
 * POST /projects/:projectId/keywords
 * Add a keyword to a project
 */
router.post('/:projectId/keywords', validators_1.validateProjectId, validators_1.validateAddKeyword, projectController_1.addKeywordToProject);
/**
 * POST /projects/:projectId/checks
 * Create a rank check (schedule/trigger a check)
 */
router.post('/:projectId/checks', validators_1.validateProjectId, validators_1.validateCreateRankCheck, projectController_1.createRankCheck);
/**
 * GET /projects/:projectId/keywords/:keywordId/ranks
 * Query rank results for a keyword (time-series)
 */
router.get('/:projectId/keywords/:keywordId/ranks', validators_1.validateProjectId, validators_1.validateKeywordId, projectController_1.getKeywordRanks);
exports.default = router;
