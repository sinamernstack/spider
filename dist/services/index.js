"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankResultService = exports.RankCheckService = exports.KeywordService = exports.ProjectService = void 0;
const data_source_1 = require("../data-source");
const Project_1 = require("../entities/Project");
const Keyword_1 = require("../entities/Keyword");
const RankCheck_1 = require("../entities/RankCheck");
const RankResult_1 = require("../entities/RankResult");
/**
 * Project Service - Business logic for projects
 */
class ProjectService {
    constructor() {
        this.projectRepo = data_source_1.AppDataSource.getRepository(Project_1.Project);
    }
    async createProject(name, domain_id, owner_id) {
        const project = this.projectRepo.create({
            name,
            domain: { id: domain_id },
            owner_id,
        });
        return await this.projectRepo.save(project);
    }
    async getProject(projectId) {
        return await this.projectRepo.findOne({ where: { id: projectId } });
    }
    async getAllProjects() {
        return await this.projectRepo.find();
    }
}
exports.ProjectService = ProjectService;
/**
 * Keyword Service - Business logic for keywords
 */
class KeywordService {
    constructor() {
        this.keywordRepo = data_source_1.AppDataSource.getRepository(Keyword_1.Keyword);
    }
    async addKeyword(projectId, keyword, language, normalizedKeyword) {
        const kw = this.keywordRepo.create({
            project_id: projectId,
            keyword,
            normalized_keyword: normalizedKeyword || keyword.toLowerCase(),
            language,
        });
        return await this.keywordRepo.save(kw);
    }
    async getKeywordsByProject(projectId) {
        return await this.keywordRepo.find({ where: { project_id: projectId } });
    }
}
exports.KeywordService = KeywordService;
/**
 * Rank Check Service - Business logic for rank checks
 */
class RankCheckService {
    constructor() {
        this.rankCheckRepo = data_source_1.AppDataSource.getRepository(RankCheck_1.RankCheck);
    }
    async createRankCheck(projectId, scheduledAt) {
        const check = this.rankCheckRepo.create({
            project_id: projectId,
            scheduled_at: scheduledAt || new Date(),
        });
        return await this.rankCheckRepo.save(check);
    }
    async getPendingChecks() {
        return await this.rankCheckRepo
            .createQueryBuilder('rc')
            .where('rc.status = :status', { status: 0 })
            .andWhere('rc.scheduled_at <= :now', { now: new Date() })
            .getMany();
    }
}
exports.RankCheckService = RankCheckService;
/**
 * Rank Result Service - Business logic for rank results
 */
class RankResultService {
    constructor() {
        this.rankResultRepo = data_source_1.AppDataSource.getRepository(RankResult_1.RankResult);
    }
    async getRanksByKeyword(projectId, keywordId, options) {
        const qb = this.rankResultRepo
            .createQueryBuilder('r')
            .where('r.project_id = :projectId', { projectId })
            .andWhere('r.keyword_id = :keywordId', { keywordId });
        if (options?.from) {
            qb.andWhere('r.checked_at >= :from', { from: options.from });
        }
        if (options?.to) {
            qb.andWhere('r.checked_at <= :to', { to: options.to });
        }
        qb.orderBy('r.checked_at', 'DESC');
        if (options?.limit) {
            qb.limit(options.limit);
        }
        return await qb.getMany();
    }
    async saveRankResult(result) {
        const rankResult = this.rankResultRepo.create(result);
        return await this.rankResultRepo.save(rankResult);
    }
}
exports.RankResultService = RankResultService;
