/**
 * GET /api/v1/books/[id]
 *
 * Returns a single approved book by ID.
 * Served from Redis cache (10 min TTL) on cache hit.
 *
 * Rate Limit: 120 req/min per IP
 */

import { NextRequest } from 'next/server';
import { ok, ApiErrors } from '@/lib/api-response';
import { rateLimit, RateLimits, rateLimitHeaders } from '@/lib/rate-limit';
import { getCachedBook } from '@/features/books/cache/books.cache';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rlResult = await rateLimit(request, RateLimits.catalog);
  if (!rlResult.success) return ApiErrors.tooManyRequests();

  const bookId = params.id;

  if (!bookId || isNaN(Number(bookId))) {
    return ApiErrors.badRequest('Book ID must be a valid number');
  }

  try {
    const { book, cached } = await getCachedBook(bookId);

    if (!book) {
      return ApiErrors.notFound(`Book with ID ${bookId} not found or not yet approved`);
    }

    logger.info('[api/books/[id]] Book served', { bookId, cached });

    return ok(
      book,
      { cached },
      200,
      {
        ...rateLimitHeaders(rlResult),
        'Cache-Control': cached
          ? 'public, s-maxage=300, stale-while-revalidate=600'
          : 'no-store',
      }
    );
  } catch (err: any) {
    logger.error('[api/books/[id]] Unhandled error', { bookId, error: err.message });
    return ApiErrors.internal();
  }
}
