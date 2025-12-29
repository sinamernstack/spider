"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireSlot = acquireSlot;
exports.getCurrentCount = getCurrentCount;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
});
/**
 * Simple sliding-window limiter using INCR + EXPIRE.
 * Key is namespaced as `rl:{key}:{windowStart}` to avoid races.
 * This is atomic and suitable for distributed workers.
 */
async function acquireSlot(key, limit, windowSec) {
    const windowStart = Math.floor(Date.now() / 1000 / windowSec) * windowSec;
    const redisKey = `rl:${key}:${windowStart}`;
    const cur = await redis.incr(redisKey);
    if (cur === 1) {
        await redis.expire(redisKey, windowSec + 1);
    }
    return cur <= limit;
}
async function getCurrentCount(key, windowSec) {
    const windowStart = Math.floor(Date.now() / 1000 / windowSec) * windowSec;
    const redisKey = `rl:${key}:${windowStart}`;
    const v = await redis.get(redisKey);
    return parseInt(v || '0', 10);
}
exports.default = { acquireSlot, getCurrentCount };
