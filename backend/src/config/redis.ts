import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;
let redisAvailable = false;

export async function connectRedis(): Promise<void> {
  // Skip Redis entirely if not configured
  if (!process.env.REDIS_URL) {
    logger.info('ℹ️  REDIS_URL not set — skipping Redis. Caching will be disabled.');
    return;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      // Stop retrying after 3 attempts so the terminal stays clean
      reconnectStrategy: (retries) => {
        if (retries >= 3) {
          logger.warn('Redis: max reconnect attempts reached, giving up.');
          return false; // stops reconnecting
        }
        return Math.min(retries * 200, 2000);
      },
    },
  });

  redisClient.on('error', (err) => logger.warn('Redis error:', err.message));
  redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));

  await redisClient.connect();
  redisAvailable = true;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

export function getRedisClient() {
  if (!redisClient || !redisAvailable) {
    throw new Error('Redis client not available');
  }
  return redisClient;
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  if (!redisAvailable) return;
  try {
    const client = getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    logger.warn('Redis setCache error:', error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisAvailable) return null;
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.warn('Redis getCache error:', error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redisAvailable) return;
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.warn('Redis deleteCache error:', error);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!redisAvailable) return;
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    logger.warn('Redis deleteCachePattern error:', error);
  }
}
