"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateKeywordId = exports.validateProjectId = exports.validateCreateRankCheck = exports.validateAddKeyword = exports.validateCreateProject = void 0;
/**
 * Validate create project request
 * Accepts either domain_id (legacy) or domain_host (new)
 */
const validateCreateProject = (req, res, next) => {
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
exports.validateCreateProject = validateCreateProject;
/**
 * Validate add keyword request
 */
const validateAddKeyword = (req, res, next) => {
    const { keyword } = req.body;
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        res.status(400).json({ error: 'Invalid keyword: must be a non-empty string' });
        return;
    }
    next();
};
exports.validateAddKeyword = validateAddKeyword;
/**
 * Validate create rank check request
 */
const validateCreateRankCheck = (req, res, next) => {
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
exports.validateCreateRankCheck = validateCreateRankCheck;
/**
 * Validate params containing projectId
 */
const validateProjectId = (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
        res.status(400).json({ error: 'Invalid projectId: must be a non-empty string' });
        return;
    }
    next();
};
exports.validateProjectId = validateProjectId;
/**
 * Validate params containing keywordId
 */
const validateKeywordId = (req, res, next) => {
    const { keywordId } = req.params;
    if (!keywordId || typeof keywordId !== 'string' || keywordId.trim().length === 0) {
        res.status(400).json({ error: 'Invalid keywordId: must be a non-empty string' });
        return;
    }
    next();
};
exports.validateKeywordId = validateKeywordId;
