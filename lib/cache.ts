/**
 * lib/cache.ts
 *
 * Redis cache layer using Upstash REST API.
 *
 * Why Upstash REST instead of ioredis?
 * - Works in Vercel Edge/Serverless without native Node.js bindings
 * - Zero cold-start penalty (HTTP vs persistent TCP)
 * - Free tier covers small-to-medium library workloads
 *
 * GRACEFUL DEGRADATION: If Redis env vars are not set, every cache
 * operation becomes a no-op. The app stays fully functional — just without
 * the caching performance boost. This makes local development trivial.
 *
 * Environment variables required for caching to activate:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { logger } from './logger';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const IS_CACHE_AVAILABLE = !!(REDIS_URL && REDIS_TOKEN);

if (!IS_CACHE_AVAILABLE) {
  logger.warn(
    '[cache] Redis not configured — caching disabled. ' +
    'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.'
  );
}

/** Execute a Redis command via the Upstash REST API */
async function redisCommand<T>(command: string[]): Promise<T | null> {
  if (!IS_CACHE_AVAILABLE) return null;

  try {
    const res = await fetch(`${REDIS_URL}/${command.map(encodeURIComponent).join('/')}`, {
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
      // Don't cache fetch responses — we ARE the cache layer
      cache: 'no-store',
    });

    if (!res.ok) {
      logger.warn('[cache] Redis command failed', { command: command[0], status: res.status });
      return null;
    }

    const json = await res.json();
    return json.result as T;
  } catch (err: any) {
    logger.warn('[cache] Redis unreachable, skipping cache', { error: err.message });
    return null;
  }
}

/** Cache abstraction with get, set, del, and invalidatePattern */
export const cache = {
  /**
   * Read a value from cache.
   * Returns null on cache miss or if cache is disabled.
   */
  async get<T>(key: string): Promise<T | null> {
    const raw = await redisCommand<string>(['GET', key]);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * Write a value to cache with a TTL in seconds.
   * Silently no-ops if cache is unavailable.
   */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await redisCommand(['SET', key, serialized, 'EX', String(ttlSeconds)]);
  },

  /**
   * Remove a specific key from cache.
   */
  async del(key: string): Promise<void> {
    await redisCommand(['DEL', key]);
  },

  /**
   * Increment a counter atomically (used by rate limiter).
   */
  async incr(key: string): Promise<number> {
    const result = await redisCommand<number>(['INCR', key]);
    return result ?? 0;
  },

  /**
   * Set expiry on an existing key.
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await redisCommand(['EXPIRE', key, String(ttlSeconds)]);
  },

  /**
   * Get remaining TTL for a key in seconds.
   * Returns -1 if key has no expiry, -2 if key doesn't exist.
   */
  async ttl(key: string): Promise<number> {
    const result = await redisCommand<number>(['TTL', key]);
    return result ?? -2;
  },

  /**
   * Cache-aside helper: reads from cache, falls back to fn(), then caches result.
   * This is the recommended pattern for all API routes.
   *
   * @example
   * const books = await cache.remember('catalog:approved', 300, () => fetchApprovedBooks());
   */
  async remember<T>(
    key: string,
    ttlSeconds: number,
    fn: () => Promise<T>
  ): Promise<{ data: T; cached: boolean }> {
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      return { data: cached, cached: true };
    }

    const fresh = await fn();
    await cache.set(key, fresh, ttlSeconds);
    return { data: fresh, cached: false };
  },

  isAvailable: IS_CACHE_AVAILABLE,
};

/** Well-known cache key factories — prevents typos and ensures consistent naming */
export const CacheKeys = {
  catalog: () => 'catalog:approved',
  book: (id: string | number) => `book:${id}`,
  events: () => 'events:upcoming',
  searchResults: (query: string) => `search:${query.toLowerCase().trim().slice(0, 100)}`,
  loanStatus: (email: string, bookId: string | number) =>
    `loans:status:${email}:${bookId}`,
  readingProgress: (email: string, bookId: string | number) =>
    `reading:progress:${email}:${bookId}`,
};

/** TTL constants in seconds — single source of truth */
export const CacheTTL = {
  catalog: 5 * 60,          // 5 minutes
  book: 10 * 60,             // 10 minutes
  events: 15 * 60,           // 15 minutes
  searchResults: 2 * 60,     // 2 minutes
  loanStatus: 30,            // 30 seconds (real-time feel)
  readingProgress: 60,       // 1 minute
};
