/**
 * GET /api/v1/books
 *
 * Returns the approved books catalog with pagination.
 * Results are served from Redis cache (5 min TTL) on cache hit.
 *
 * Query Parameters:
 *   page    - Page number (default: 1)
 *   limit   - Items per page (default: 20, max: 100)
 *   category - Filter by category (optional)
 *
 * Rate Limit: 120 req/min per IP
 */

import { NextRequest } from 'next/server';
import { ok, ApiErrors, parsePagination } from '@/lib/api-response';
import { rateLimit, RateLimits, rateLimitHeaders } from '@/lib/rate-limit';
import { getCachedCatalog } from '@/features/books/cache/books.cache';
import { logger } from '@/lib/logger';
import type { Book } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rlResult = await rateLimit(request, RateLimits.catalog);
  if (!rlResult.success) {
    return ApiErrors.tooManyRequests();
  }

  try {
    const { searchParams } = request.nextUrl;
    const { page, limit, offset } = parsePagination(searchParams);
    const categoryFilter = searchParams.get('category')?.trim().toLowerCase() || null;

    // Fetch from cache or DB
    const { books: allBooks, cached } = await getCachedCatalog();

    // Filter by category if provided (done in-memory since catalog is cached)
    const filtered: Book[] = categoryFilter
      ? allBooks.filter((b) => b.category?.toLowerCase() === categoryFilter)
      : allBooks;

    // Paginate in-memory
    const paginated = filtered.slice(offset, offset + limit);
    const total = filtered.length;

    logger.info('[api/books] Catalog served', {
      cached,
      total,
      page,
      limit,
      category: categoryFilter,
    });

    return ok(
      paginated,
      { page, limit, total, cached },
      200,
      {
        ...rateLimitHeaders(rlResult),
        'Cache-Control': cached ? 'public, s-maxage=60, stale-while-revalidate=300' : 'no-store',
      }
    );
  } catch (err: any) {
    logger.error('[api/books] Unhandled error', { error: err.message });
    return ApiErrors.internal();
  }
}
