import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '../entities/Project';
import { Domain } from '../entities/Domain';
import { Keyword } from '../entities/Keyword';
import { RankResult } from '../entities/RankResult';
import {
  validateCreateProject,
  validateAddKeyword,
  validateCreateRankCheck,
  validateProjectId,
  validateKeywordId,
} from '../middleware/validators';
import {
  createProject,
  addKeywordToProject,
  createRankCheck,
  getKeywordRanks,
} from '../controllers/projectController';

const router = Router();

// GET /api/projects
router.get('/projects', async (_req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Project);
  const projects = await repo.find({ relations: ['domain'] });
  res.json(projects);
});

// POST /api/projects
router.post('/projects', async (req: Request, res: Response) => {
  try {
    const { name, domain_host, domain_id } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    if (!domain_host && !domain_id) return res.status(400).json({ error: 'domain_host or domain_id required' });

    const dRepo = AppDataSource.getRepository(Domain);
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
      domain = await dRepo.save({ host: domain_host } as any);
    }

    if (!domain) {
      return res.status(400).json({ error: 'Cannot find or create domain' });
    }

    const pRepo = AppDataSource.getRepository(Project);
    const project = await pRepo.save({ name, domain } as any);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/projects/:projectId/keywords
router.get('/projects/:projectId/keywords', validateProjectId, async (req: Request, res: Response) => {
  const kwRepo = AppDataSource.getRepository(Keyword);
  const kws = await kwRepo.find({ where: { project_id: req.params.projectId } });
  res.json(kws);
});

// POST /api/projects/:projectId/keywords
router.post('/projects/:projectId/keywords', validateProjectId, validateAddKeyword, async (req: Request, res: Response) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });
  const kwRepo = AppDataSource.getRepository(Keyword);
  const saved = await kwRepo.save({ project_id: req.params.projectId, keyword, normalized_keyword: keyword.toLowerCase(), language: 'fa' } as any);
  res.status(201).json(saved);
});

// POST /api/projects/:projectId/checks
router.post('/projects/:projectId/checks', validateProjectId, validateCreateRankCheck, createRankCheck);

// GET /api/projects/:projectId/keywords/:keywordId/ranks
router.get('/projects/:projectId/keywords/:keywordId/ranks', validateProjectId, validateKeywordId, getKeywordRanks);

// GET /api/results
router.get('/results', async (req: Request, res: Response) => {
  const rrRepo = AppDataSource.getRepository(RankResult);
  const projectId = req.query.project_id as string | undefined;
  const limit = parseInt((req.query.limit as string) || '50', 10);
  const where: any = {};
  if (projectId) where.project_id = projectId;
  const results = await rrRepo.find({ where, order: { checked_at: 'DESC' }, take: limit });
  res.json(results);
});

export default router;
