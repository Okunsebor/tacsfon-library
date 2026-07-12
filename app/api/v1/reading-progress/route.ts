/**
 * POST /api/v1/reading-progress       — Save reading position
 * GET  /api/v1/reading-progress/[bookId] — Restore reading position
 *
 * Allows readers to resume exactly where they stopped, across devices
 * and sessions. Progress is stored in the reading_progress table (DB)
 * with a Redis cache in front for fast reads.
 *
 * POST body:
 * {
 *   user_email: string,
 *   book_id: number,
 *   paragraph_index: number,
 *   scroll_position: number
 * }
 */

import { NextRequest } from 'next/server';
import { ok, ApiErrors } from '@/lib/api-response';
import { rateLimit, RateLimits } from '@/lib/rate-limit';
import { db } from '@/lib/db';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/v1/reading-progress ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rlResult = await rateLimit(request, { limit: 60, windowSeconds: 60 });
  if (!rlResult.success) return ApiErrors.tooManyRequests();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return ApiErrors.badRequest('Request body must be valid JSON');
  }

  const { user_email, book_id, paragraph_index, scroll_position } = body || {};

  // Validation
  if (!user_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email)) {
    return ApiErrors.badRequest('user_email must be a valid email address');
  }
  if (!book_id || typeof book_id !== 'number') {
    return ApiErrors.badRequest('book_id must be a valid number');
  }
  if (typeof paragraph_index !== 'number' || paragraph_index < 0) {
    return ApiErrors.badRequest('paragraph_index must be a non-negative number');
  }
  if (typeof scroll_position !== 'number' || scroll_position < 0) {
    return ApiErrors.badRequest('scroll_position must be a non-negative number');
  }

  try {
    // Upsert reading progress (INSERT or UPDATE on conflict)
    const { error } = await db
      .from('reading_progress')
      .upsert(
        {
          user_email: user_email.toLowerCase().trim(),
          book_id,
          paragraph_index,
          scroll_position,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_email,book_id' }
      );

    if (error) {
      // Table may not exist yet — degrade gracefully with a warning
      if (error.code === '42P01') {
        logger.warn('[api/reading-progress] reading_progress table does not exist — run migration');
        return ok({ saved: false, reason: 'migration_pending' });
      }
      logger.error('[api/reading-progress] Upsert failed', { error: error.message });
      return ApiErrors.internal('Failed to save reading progress');
    }

    // Update cache to reflect new progress immediately
    const cacheKey = CacheKeys.readingProgress(user_email, book_id);
    await cache.set(
      cacheKey,
      { paragraph_index, scroll_position, updated_at: new Date().toISOString() },
      CacheTTL.readingProgress
    );

    logger.info('[api/reading-progress] Progress saved', {
      email: user_email,
      bookId: book_id,
      paragraphIndex: paragraph_index,
    });

    return ok({ saved: true });
  } catch (err: any) {
    logger.error('[api/reading-progress] Unhandled error', { error: err.message });
    return ApiErrors.internal();
  }
}

// ─── GET /api/v1/reading-progress ────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const rlResult = await rateLimit(request, RateLimits.catalog);
  if (!rlResult.success) return ApiErrors.tooManyRequests();

  const { searchParams } = request.nextUrl;
  const email = searchParams.get('email')?.trim().toLowerCase();
  const bookId = searchParams.get('book_id');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return ApiErrors.badRequest('A valid "email" query parameter is required');
  }
  if (!bookId || isNaN(Number(bookId))) {
    return ApiErrors.badRequest('"book_id" must be a valid number');
  }

  const cacheKey = CacheKeys.readingProgress(email, bookId);

  try {
    // Try cache first
    const cached = await cache.get<any>(cacheKey);
    if (cached) {
      return ok(cached, { cached: true });
    }

    // Fallback to database
    const { data, error } = await db
      .from('reading_progress')
      .select('paragraph_index, scroll_position, updated_at')
      .eq('user_email', email)
      .eq('book_id', Number(bookId))
      .maybeSingle();

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet — return default progress
        return ok({ paragraph_index: 0, scroll_position: 0, updated_at: null });
      }
      return ApiErrors.internal('Failed to retrieve reading progress');
    }

    const progress = data || { paragraph_index: 0, scroll_position: 0, updated_at: null };

    // Warm the cache
    if (data) {
      await cache.set(cacheKey, progress, CacheTTL.readingProgress);
    }

    return ok(progress, { cached: false });
  } catch (err: any) {
    logger.error('[api/reading-progress] Unhandled error', { error: err.message });
    return ApiErrors.internal();
  }
}
