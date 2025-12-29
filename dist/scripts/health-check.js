"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function run() {
    // Check Postgres
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Postgres: ok');
        await data_source_1.AppDataSource.destroy();
    }
    catch (err) {
        console.error('Postgres: error', err?.message || err);
        process.exit(2);
    }
    // Check Redis
    const redis = new ioredis_1.default({ host: process.env.REDIS_HOST || '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379', 10) });
    try {
        const pong = await redis.ping();
        console.log('Redis: ok', pong);
        await redis.quit();
    }
    catch (err) {
        console.error('Redis: error', err?.message || err);
        process.exit(3);
    }
    console.log('All checks passed');
    process.exit(0);
}
run();
