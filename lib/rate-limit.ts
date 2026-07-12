/**
 * lib/rate-limit.ts
 *
 * Sliding window rate limiter backed by Redis.
 *
 * Algorithm: Sliding Window Counter
 * - More accurate than fixed-window (no burst at window boundaries)
 * - Two keys per identifier: current window + previous window
 * - Weighted count = (prev_count × remaining_fraction) + current_count
 *
 * Degrades gracefully: if Redis is unavailable, ALL requests are allowed.
 * This is intentional — it's better to serve requests than to lock out
 * all users because the cache layer is down.
 *
 * Usage:
 *   const result = await rateLimit(request, { limit: 60, window: 60 });
 *   if (!result.success) return ApiErrors.tooManyRequests();
 */

import { NextRequest } from 'next/server';
import { cache } from './cache';
import { logger } from './logger';

export interface RateLimitConfig {
  /** Max requests allowed per window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Optional identifier override — defaults to IP */
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp (seconds)
}

/**
 * Extract the client IP from a Next.js request.
 * Handles X-Forwarded-For (Vercel/proxies) and falls back to a safe default.
 */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

/**
 * Apply sliding window rate limit to a request.
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowSeconds, identifier: identifierOverride } = config;
  const identifier = identifierOverride || getClientIdentifier(request);
  const now = Math.floor(Date.now() / 1000);
  const currentWindow = Math.floor(now / windowSeconds);
  const prevWindow = currentWindow - 1;

  const currentKey = `rl:${identifier}:${currentWindow}`;
  const prevKey = `rl:${identifier}:${prevWindow}`;
  const resetAt = (currentWindow + 1) * windowSeconds;

  if (!cache.isAvailable) {
    // Graceful degradation: allow all requests when Redis is down
    return { success: true, limit, remaining: limit, resetAt };
  }

  try {
    // Get previous window count to calculate the sliding weight
    const prevCount = (await cache.get<number>(prevKey)) ?? 0;
    const elapsedFraction = (now % windowSeconds) / windowSeconds;
    const slidingCount = prevCount * (1 - elapsedFraction);

    // Increment current window counter
    const currentCount = await cache.incr(currentKey);

    // Set expiry on first request of this window
    if (currentCount === 1) {
      await cache.expire(currentKey, windowSeconds * 2);
    }

    const totalCount = slidingCount + currentCount;
    const remaining = Math.max(0, limit - Math.ceil(totalCount));
    const success = totalCount <= limit;

    if (!success) {
      logger.warn('[rate-limit] Request blocked', {
        identifier,
        totalCount: Math.round(totalCount),
        limit,
      });
    }

    return { success, limit, remaining, resetAt };
  } catch (err: any) {
    // Fail open — don't block users if rate limiter crashes
    logger.warn('[rate-limit] Failed, allowing request', { error: err.message });
    return { success: true, limit, remaining: limit, resetAt };
  }
}

/** Pre-configured limits for different endpoint classes */
export const RateLimits = {
  /** Generous limit for public catalog browsing */
  catalog: { limit: 120, windowSeconds: 60 },
  /** Tight limit for search (more expensive queries) */
  search: { limit: 30, windowSeconds: 60 },
  /** Very tight limit for write operations */
  mutations: { limit: 10, windowSeconds: 60 },
  /** Auth operations */
  auth: { limit: 5, windowSeconds: 60 },
};

/** Add standard rate-limit headers to a response */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
    ...(result.success ? {} : { 'Retry-After': String(result.resetAt - Math.floor(Date.now() / 1000)) }),
  };
}
