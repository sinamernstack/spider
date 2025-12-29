"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const Domain_1 = require("./entities/Domain");
const Project_1 = require("./entities/Project");
const ProjectSettings_1 = require("./entities/ProjectSettings");
const Keyword_1 = require("./entities/Keyword");
const Competitor_1 = require("./entities/Competitor");
const KeywordTarget_1 = require("./entities/KeywordTarget");
const SearchEngine_1 = require("./entities/SearchEngine");
const RankCheck_1 = require("./entities/RankCheck");
const RankResult_1 = require("./entities/RankResult");
const SerpSnapshot_1 = require("./entities/SerpSnapshot");
const AuditEvent_1 = require("./entities/AuditEvent");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: 'faq666',
    database: process.env.DATABASE_NAME || 'seo_rank',
    synchronize: false,
    logging: false,
    entities: [
        Domain_1.Domain,
        Project_1.Project,
        ProjectSettings_1.ProjectSettings,
        Keyword_1.Keyword,
        Competitor_1.Competitor,
        KeywordTarget_1.KeywordTarget,
        SearchEngine_1.SearchEngine,
        RankCheck_1.RankCheck,
        RankResult_1.RankResult,
        SerpSnapshot_1.SerpSnapshot,
        AuditEvent_1.AuditEvent,
    ],
    migrations: [__dirname + '/migration/*{.ts,.js}'],
    migrationsRun: false,
});
