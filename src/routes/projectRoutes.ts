import { Router, Request, Response } from 'express';
import {
  createProject,
  addKeywordToProject,
  createRankCheck,
  getKeywordRanks,
} from '../controllers/projectController';
import {
  validateCreateProject,
  validateAddKeyword,
  validateCreateRankCheck,
  validateProjectId,
  validateKeywordId,
} from '../middleware/validators';
import { AppDataSource } from '../data-source';
import { Project } from '../entities/Project';

const router = Router();

/**
 * GET /projects
 * List all projects
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const projectRepo = AppDataSource.getRepository(Project);
    const projects = await projectRepo.find({ relations: ['domain'] });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /projects
 * Create a new project
 */
router.post('/', validateCreateProject, createProject);

/**
 * POST /projects/:projectId/keywords
 * Add a keyword to a project
 */
router.post('/:projectId/keywords', validateProjectId, validateAddKeyword, addKeywordToProject);

/**
 * POST /projects/:projectId/checks
 * Create a rank check (schedule/trigger a check)
 */
router.post('/:projectId/checks', validateProjectId, validateCreateRankCheck, createRankCheck);

/**
 * GET /projects/:projectId/keywords/:keywordId/ranks
 * Query rank results for a keyword (time-series)
 */
router.get('/:projectId/keywords/:keywordId/ranks', validateProjectId, validateKeywordId, getKeywordRanks);

export default router;
