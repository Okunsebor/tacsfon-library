/**
 * GET /api/v1/search
 *
 * Full-text search across book titles, authors, and summaries.
 * Results are cached for 2 minutes to absorb duplicate queries.
 *
 * Query Parameters:
 *   q     - Search query (required, min 2 chars)
 *   page  - Page number (default: 1)
 *   limit - Items per page (default: 20, max: 50)
 *
 * Rate Limit: 30 req/min per IP (stricter — search is expensive)
 */

import { NextRequest } from 'next/server';
import { ok, ApiErrors, parsePagination } from '@/lib/api-response';
import { rateLimit, RateLimits, rateLimitHeaders } from '@/lib/rate-limit';
import { searchBooks } from '@/features/books/cache/books.cache';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const rlResult = await rateLimit(request, RateLimits.search);
  if (!rlResult.success) return ApiErrors.tooManyRequests();

  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q')?.trim() || '';

  if (!query || query.length < 2) {
    return ApiErrors.badRequest('Search query "q" must be at least 2 characters');
  }

  if (query.length > 200) {
    return ApiErrors.badRequest('Search query must not exceed 200 characters');
  }

  const { page, limit, offset } = parsePagination(searchParams);
  // Cap search limit lower than catalog to protect DB
  const searchLimit = Math.min(limit, 50);

  try {
    const { books, total, cached } = await searchBooks(query, searchLimit, offset);

    logger.info('[api/search] Search served', {
      query,
      resultsCount: books.length,
      total,
      cached,
      page,
    });

    return ok(
      books,
      { page, limit: searchLimit, total, cached },
      200,
      {
        ...rateLimitHeaders(rlResult),
        'Cache-Control': 'no-store', // Search results should not be publicly cached at CDN
      }
    );
  } catch (err: any) {
    logger.error('[api/search] Unhandled error', { query, error: err.message });
    return ApiErrors.internal();
  }
}
