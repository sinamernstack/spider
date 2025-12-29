import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

/**
 * Simple sliding-window limiter using INCR + EXPIRE.
 * Key is namespaced as `rl:{key}:{windowStart}` to avoid races.
 * This is atomic and suitable for distributed workers.
 */
export async function acquireSlot(key: string, limit: number, windowSec: number) {
  const windowStart = Math.floor(Date.now() / 1000 / windowSec) * windowSec;
  const redisKey = `rl:${key}:${windowStart}`;
  const cur = await redis.incr(redisKey);
  if (cur === 1) {
    await redis.expire(redisKey, windowSec + 1);
  }
  return cur <= limit;
}

export async function getCurrentCount(key: string, windowSec: number) {
  const windowStart = Math.floor(Date.now() / 1000 / windowSec) * windowSec;
  const redisKey = `rl:${key}:${windowStart}`;
  const v = await redis.get(redisKey);
  return parseInt(v || '0', 10);
}

export default { acquireSlot, getCurrentCount };
