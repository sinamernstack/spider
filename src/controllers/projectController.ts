import { Request, Response } from 'express';
import { ProjectService, KeywordService, RankCheckService, RankResultService } from '../services';

// Initialize services
const projectService = new ProjectService();
const keywordService = new KeywordService();
const rankCheckService = new RankCheckService();
const rankResultService = new RankResultService();

/**
 * Create a new project
 */
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, domain_id, owner_id } = req.body;

    if (!name || !domain_id) {
      res.status(400).json({ error: 'name and domain_id required' });
      return;
    }

    const project = await projectService.createProject(name, domain_id, owner_id);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project', details: String(error) });
  }
};

/**
 * Add a keyword to a project
 */
export const addKeywordToProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { keyword, normalized_keyword, language } = req.body;

    if (!keyword) {
      res.status(400).json({ error: 'keyword required' });
      return;
    }

    const kw = await keywordService.addKeyword(projectId, keyword, language, normalized_keyword);
    res.status(201).json(kw);
  } catch (error) {
    console.error('Error adding keyword:', error);
    res.status(500).json({ error: 'Failed to add keyword', details: String(error) });
  }
};

/**
 * Create a rank check (schedule/trigger a check)
 */
export const createRankCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { scheduled_at } = req.body;

    const check = await rankCheckService.createRankCheck(projectId, scheduled_at ? new Date(scheduled_at) : undefined);
    res.status(201).json(check);
  } catch (error) {
    console.error('Error creating rank check:', error);
    res.status(500).json({ error: 'Failed to create rank check', details: String(error) });
  }
};

/**
 * Query rank results for a keyword (time-series)
 */
export const getKeywordRanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, keywordId } = req.params;
    const { from, to, limit } = req.query;

    const options = {
      from: from ? new Date(String(from)) : undefined,
      to: to ? new Date(String(to)) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    };

    const ranks = await rankResultService.getRanksByKeyword(projectId, keywordId, options);
    res.json(ranks);
  } catch (error) {
    console.error('Error querying rank results:', error);
    res.status(500).json({ error: 'Failed to query rank results', details: String(error) });
  }
};
