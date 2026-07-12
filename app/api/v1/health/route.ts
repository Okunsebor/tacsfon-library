/**
 * GET /api/v1/health
 *
 * System health check endpoint for load balancers, uptime monitors,
 * and observability dashboards.
 *
 * Returns:
 *   200 → All systems operational
 *   503 → One or more systems degraded
 *
 * Response shape:
 * {
 *   success: true,
 *   data: {
 *     status: 'ok' | 'degraded',
 *     version: string,
 *     checks: {
 *       database: 'ok' | 'error',
 *       cache: 'ok' | 'disabled' | 'error'
 *     },
 *     uptimeMs: number
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';

const SERVER_START = Date.now();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const checks: Record<string, string> = {};
  let isHealthy = true;

  // --- Database Check ---
  try {
    const { error } = await db
      .from('books')
      .select('id')
      .limit(1);

    checks.database = error ? 'error' : 'ok';
    if (error) {
      isHealthy = false;
      logger.warn('[health] Database check failed', { error: error.message });
    }
  } catch (err: any) {
    checks.database = 'error';
    isHealthy = false;
    logger.error('[health] Database unreachable', { error: err.message });
  }

  // --- Cache Check ---
  if (!cache.isAvailable) {
    checks.cache = 'disabled';
  } else {
    try {
      const testKey = '__health_check__';
      await cache.set(testKey, 1, 10);
      const val = await cache.get(testKey);
      checks.cache = val === 1 ? 'ok' : 'error';
      if (val !== 1) isHealthy = false;
    } catch (err: any) {
      checks.cache = 'error';
      // Cache failure is degraded, not fatal
      logger.warn('[health] Cache check failed', { error: err.message });
    }
  }

  const status = isHealthy ? 'ok' : 'degraded';
  const httpStatus = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      success: isHealthy,
      data: {
        status,
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        checks,
        uptimeMs: Date.now() - SERVER_START,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
        'Cache-Control': 'no-store, no-cache',
      },
    }
  );
}
