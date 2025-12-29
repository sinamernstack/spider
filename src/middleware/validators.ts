import { Request, Response, NextFunction } from 'express';

/**
 * Validation schema for create project request
 */
export interface CreateProjectRequest {
  name: string;
  domain_id?: string;
  domain_host?: string;
  owner_id?: string;
}

/**
 * Validation schema for add keyword request
 */
export interface AddKeywordRequest {
  keyword: string;
  normalized_keyword?: string;
  language?: string;
}

/**
 * Validation schema for create rank check request
 */
export interface CreateRankCheckRequest {
  scheduled_at?: string;
}

/**
 * Validate create project request
 * Accepts either domain_id (legacy) or domain_host (new)
 */
export const validateCreateProject = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, domain_id, domain_host } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Invalid name: must be a non-empty string' });
    return;
  }

  if (!domain_id && !domain_host) {
    res.status(400).json({ error: 'Either domain_id or domain_host is required' });
    return;
  }

  if (domain_id && typeof domain_id !== 'string') {
    res.status(400).json({ error: 'Invalid domain_id: must be a string' });
    return;
  }

  if (domain_host && typeof domain_host !== 'string') {
    res.status(400).json({ error: 'Invalid domain_host: must be a string' });
    return;
  }

  next();
};

/**
 * Validate add keyword request
 */
export const validateAddKeyword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { keyword } = req.body;

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
    res.status(400).json({ error: 'Invalid keyword: must be a non-empty string' });
    return;
  }

  next();
};

/**
 * Validate create rank check request
 */
export const validateCreateRankCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { scheduled_at } = req.body;

  if (scheduled_at && typeof scheduled_at !== 'string') {
    res.status(400).json({ error: 'Invalid scheduled_at: must be a date string' });
    return;
  }

  if (scheduled_at) {
    const date = new Date(scheduled_at);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'Invalid scheduled_at: must be a valid date' });
      return;
    }
  }

  next();
};

/**
 * Validate params containing projectId
 */
export const validateProjectId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
    res.status(400).json({ error: 'Invalid projectId: must be a non-empty string' });
    return;
  }

  next();
};

/**
 * Validate params containing keywordId
 */
export const validateKeywordId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { keywordId } = req.params;

  if (!keywordId || typeof keywordId !== 'string' || keywordId.trim().length === 0) {
    res.status(400).json({ error: 'Invalid keywordId: must be a non-empty string' });
    return;
  }

  next();
};
