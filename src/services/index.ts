import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Project } from '../entities/Project';
import { Keyword } from '../entities/Keyword';
import { RankCheck } from '../entities/RankCheck';
import { RankResult } from '../entities/RankResult';
export * from './serp.service';


/**
 * Project Service - Business logic for projects
 */
export class ProjectService {
  private projectRepo: Repository<Project>;

  constructor() {
    this.projectRepo = AppDataSource.getRepository(Project);
  }

  async createProject(name: string, domain_id: string, owner_id?: string): Promise<Project> {
    const project = this.projectRepo.create({
      name,
      domain: { id: domain_id } as any,
      owner_id,
    });
    return await this.projectRepo.save(project);
  }

  async getProject(projectId: string): Promise<Project | null> {
    return await this.projectRepo.findOne({ where: { id: projectId } });
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.projectRepo.find();
  }
}

/**
 * Keyword Service - Business logic for keywords
 */
export class KeywordService {
  private keywordRepo: Repository<Keyword>;

  constructor() {
    this.keywordRepo = AppDataSource.getRepository(Keyword);
  }

  async addKeyword(
    projectId: string,
    keyword: string,
    language?: string,
    normalizedKeyword?: string
  ): Promise<Keyword> {
    const kw = this.keywordRepo.create({
      project_id: projectId,
      keyword,
      normalized_keyword: normalizedKeyword || keyword.toLowerCase(),
      language,
    });
    return await this.keywordRepo.save(kw);
  }

  async getKeywordsByProject(projectId: string): Promise<Keyword[]> {
    return await this.keywordRepo.find({ where: { project_id: projectId } });
  }
}

/**
 * Rank Check Service - Business logic for rank checks
 */
export class RankCheckService {
  private rankCheckRepo: Repository<RankCheck>;

  constructor() {
    this.rankCheckRepo = AppDataSource.getRepository(RankCheck);
  }

  async createRankCheck(projectId: string, scheduledAt?: Date): Promise<RankCheck> {
    const check = this.rankCheckRepo.create({
      project_id: projectId,
      scheduled_at: scheduledAt || new Date(),
    });
    return await this.rankCheckRepo.save(check);
  }

  async getPendingChecks(): Promise<RankCheck[]> {
    return await this.rankCheckRepo
      .createQueryBuilder('rc')
      .where('rc.status = :status', { status: 0 })
      .andWhere('rc.scheduled_at <= :now', { now: new Date() })
      .getMany();
  }
}

/**
 * Rank Result Service - Business logic for rank results
 */
export class RankResultService {
  private rankResultRepo: Repository<RankResult>;

  constructor() {
    this.rankResultRepo = AppDataSource.getRepository(RankResult);
  }

  async getRanksByKeyword(
    projectId: string,
    keywordId: string,
    options?: { from?: Date; to?: Date; limit?: number }
  ): Promise<RankResult[]> {
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

  async saveRankResult(result: Partial<RankResult>): Promise<RankResult> {
    const rankResult = this.rankResultRepo.create(result);
    return await this.rankResultRepo.save(rankResult);
  }
}
