"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeywordRanks = exports.createRankCheck = exports.addKeywordToProject = exports.createProject = void 0;
const services_1 = require("../services");
// Initialize services
const projectService = new services_1.ProjectService();
const keywordService = new services_1.KeywordService();
const rankCheckService = new services_1.RankCheckService();
const rankResultService = new services_1.RankResultService();
/**
 * Create a new project
 */
const createProject = async (req, res) => {
    try {
        const { name, domain_id, owner_id } = req.body;
        if (!name || !domain_id) {
            res.status(400).json({ error: 'name and domain_id required' });
            return;
        }
        const project = await projectService.createProject(name, domain_id, owner_id);
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project', details: String(error) });
    }
};
exports.createProject = createProject;
/**
 * Add a keyword to a project
 */
const addKeywordToProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { keyword, normalized_keyword, language } = req.body;
        if (!keyword) {
            res.status(400).json({ error: 'keyword required' });
            return;
        }
        const kw = await keywordService.addKeyword(projectId, keyword, language, normalized_keyword);
        res.status(201).json(kw);
    }
    catch (error) {
        console.error('Error adding keyword:', error);
        res.status(500).json({ error: 'Failed to add keyword', details: String(error) });
    }
};
exports.addKeywordToProject = addKeywordToProject;
/**
 * Create a rank check (schedule/trigger a check)
 */
const createRankCheck = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { scheduled_at } = req.body;
        const check = await rankCheckService.createRankCheck(projectId, scheduled_at ? new Date(scheduled_at) : undefined);
        res.status(201).json(check);
    }
    catch (error) {
        console.error('Error creating rank check:', error);
        res.status(500).json({ error: 'Failed to create rank check', details: String(error) });
    }
};
exports.createRankCheck = createRankCheck;
/**
 * Query rank results for a keyword (time-series)
 */
const getKeywordRanks = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error querying rank results:', error);
        res.status(500).json({ error: 'Failed to query rank results', details: String(error) });
    }
};
exports.getKeywordRanks = getKeywordRanks;
