import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Domain } from './entities/Domain';
import { Project } from './entities/Project';
import { ProjectSettings } from './entities/ProjectSettings';
import { Keyword } from './entities/Keyword';
import { Competitor } from './entities/Competitor';
import { KeywordTarget } from './entities/KeywordTarget';
import { SearchEngine } from './entities/SearchEngine';
import { RankCheck } from './entities/RankCheck';
import { RankResult } from './entities/RankResult';
import { SerpSnapshot } from './entities/SerpSnapshot';
import { AuditEvent } from './entities/AuditEvent';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: 'postgres',
  database: process.env.DATABASE_NAME || 'seo_rank',
  synchronize: false,
  logging: false,
  entities: [
    Domain,
    Project,
    ProjectSettings,
    Keyword,
    Competitor,
    KeywordTarget,
    SearchEngine,
    RankCheck,
    RankResult,
    SerpSnapshot,
    AuditEvent,
  ],
  migrations: [__dirname + '/migration/*{.ts,.js}'],
  migrationsRun: false,
});
