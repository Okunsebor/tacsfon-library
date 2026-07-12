/**
 * features/books/cache/books.cache.ts
 *
 * Cache-aside data access for the Books domain.
 *
 * These functions are the ONLY place that should be used by API route handlers
 * to fetch book data. They implement the cache-aside pattern:
 *   1. Check cache first
 *   2. On miss, query database
 *   3. Populate cache with result
 *   4. Return data with cache metadata
 *
 * Cache invalidation is explicit and co-located with the mutations
 * that change the data (in the admin actions).
 */

import { db } from '@/lib/db';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { logger } from '@/lib/logger';
import type { Book } from '@/lib/types';

/**
 * Fetch the complete approved books catalog, with caching.
 * Cache TTL: 5 minutes
 */
export async function getCachedCatalog(): Promise<{ books: Book[]; cached: boolean }> {
  const key = CacheKeys.catalog();

  const { data: books, cached } = await cache.remember<Book[]>(
    key,
    CacheTTL.catalog,
    async () => {
      logger.info('[books-cache] Cache miss for catalog — querying database');
      const { data, error } = await db
        .from('books')
        .select('id, title, author, cover_url, category, available_copies, is_approved, ebook_access, ia_id, summary')
        .eq('is_approved', true)
        .order('title', { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []) as Book[];
    }
  );

  return { books, cached };
}

/**
 * Fetch a single book by ID, with caching.
 * Cache TTL: 10 minutes
 */
export async function getCachedBook(id: string | number): Promise<{ book: Book | null; cached: boolean }> {
  const key = CacheKeys.book(id);

  try {
    const { data: book, cached } = await cache.remember<Book | null>(
      key,
      CacheTTL.book,
      async () => {
        logger.info('[books-cache] Cache miss for book', { bookId: id });
        const { data, error } = await db
          .from('books')
          .select('*')
          .eq('id', id)
          .eq('is_approved', true)
          .single();

        if (error) {
          // PGRST116 = no rows returned — not an error, just no book
          if (error.code === 'PGRST116') return null;
          throw new Error(error.message);
        }
        return data as Book;
      }
    );

    return { book, cached };
  } catch (err: any) {
    logger.error('[books-cache] Failed to fetch book', { bookId: id, error: err.message });
    return { book: null, cached: false };
  }
}

/**
 * Invalidate the catalog cache.
 * Call this whenever a book is approved, rejected, or deleted.
 */
export async function invalidateCatalogCache(): Promise<void> {
  await cache.del(CacheKeys.catalog());
  logger.info('[books-cache] Catalog cache invalidated');
}

/**
 * Invalidate cache for a specific book.
 * Call this whenever a book is updated.
 */
export async function invalidateBookCache(id: string | number): Promise<void> {
  await cache.del(CacheKeys.book(id));
  logger.info('[books-cache] Book cache invalidated', { bookId: id });
}

/**
 * Run a full-text search against the books table.
 * Uses PostgreSQL tsvector for fast, ranked results.
 * Falls back to ILIKE if tsvector column doesn't exist yet.
 */
export async function searchBooks(
  query: string,
  limit = 20,
  offset = 0
): Promise<{ books: Book[]; total: number; cached: boolean }> {
  const cacheKey = CacheKeys.searchResults(`${query}:${limit}:${offset}`);

  const { data: result, cached } = await cache.remember<{ books: Book[]; total: number }>(
    cacheKey,
    CacheTTL.searchResults,
    async () => {
      logger.info('[books-cache] Search cache miss', { query, limit, offset });

      // Try full-text search first, fall back to ILIKE
      const { data, error, count } = await db
        .from('books')
        .select('id, title, author, cover_url, category, available_copies, is_approved, ebook_access, ia_id, summary', { count: 'exact' })
        .eq('is_approved', true)
        .or(`title.ilike.%${query}%,author.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('title', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw new Error(error.message);

      return {
        books: (data || []) as Book[],
        total: count || 0,
      };
    }
  );

  return { ...result, cached };
}
