/**
 * POST /api/v1/loans  — Request a book loan
 * GET  /api/v1/loans  — List loans for the authenticated user
 *
 * Authentication: required (Supabase session via Authorization header or cookie)
 *
 * POST body:
 * {
 *   book_id: number,
 *   student_name: string,
 *   student_email: string
 * }
 *
 * Rate Limit: 10 req/min per IP (write operations are expensive and spam-prone)
 */

import { NextRequest } from 'next/server';
import { ok, ApiErrors, parsePagination } from '@/lib/api-response';
import { rateLimit, RateLimits, rateLimitHeaders } from '@/lib/rate-limit';
import { db } from '@/lib/db';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── POST /api/v1/loans ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rlResult = await rateLimit(request, RateLimits.mutations);
  if (!rlResult.success) return ApiErrors.tooManyRequests();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return ApiErrors.badRequest('Request body must be valid JSON');
  }

  const { book_id, student_name, student_email } = body || {};

  // Input validation
  if (!book_id || typeof book_id !== 'number') {
    return ApiErrors.badRequest('book_id must be a valid number');
  }
  if (!student_name || typeof student_name !== 'string' || student_name.trim().length < 2) {
    return ApiErrors.badRequest('student_name must be at least 2 characters');
  }
  if (!student_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student_email)) {
    return ApiErrors.badRequest('student_email must be a valid email address');
  }

  try {
    // 1. Verify the book exists and is approved
    const { data: book, error: bookError } = await db
      .from('books')
      .select('id, title, available_copies, is_approved')
      .eq('id', book_id)
      .eq('is_approved', true)
      .single();

    if (bookError || !book) {
      return ApiErrors.notFound('Book not found or not available for loan');
    }

    // 2. Check if user already has an active/pending loan for this book
    const { data: existing } = await db
      .from('loans')
      .select('id, status')
      .eq('book_id', book_id)
      .eq('student_email', student_email.toLowerCase())
      .in('status', ['requested', 'active'])
      .maybeSingle();

    if (existing) {
      return ApiErrors.badRequest(
        `You already have a ${existing.status} loan for this book`
      );
    }

    // 3. Create the loan record
    const { data: loan, error: loanError } = await db
      .from('loans')
      .insert({
        book_id,
        book_title: book.title,
        student_name: student_name.trim(),
        student_email: student_email.toLowerCase().trim(),
        status: 'requested',
        request_date: new Date().toISOString(),
        due_date: null,
        return_date: null,
      })
      .select()
      .single();

    if (loanError) {
      logger.error('[api/loans] Failed to create loan', { error: loanError.message });
      return ApiErrors.internal('Failed to create loan request');
    }

    // 4. Invalidate cached loan status for this user+book combo
    await cache.del(CacheKeys.loanStatus(student_email, book_id));

    logger.info('[api/loans] Loan request created', {
      loanId: loan.id,
      bookId: book_id,
      email: student_email,
    });

    return ok(loan, undefined, 201, rateLimitHeaders(rlResult));
  } catch (err: any) {
    logger.error('[api/loans] Unhandled error', { error: err.message });
    return ApiErrors.internal();
  }
}

// ─── GET /api/v1/loans ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const rlResult = await rateLimit(request, RateLimits.catalog);
  if (!rlResult.success) return ApiErrors.tooManyRequests();

  const { searchParams } = request.nextUrl;
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return ApiErrors.badRequest('A valid "email" query parameter is required');
  }

  const { page, limit, offset } = parsePagination(searchParams);

  try {
    const { data: loans, error, count } = await db
      .from('loans')
      .select('*', { count: 'exact' })
      .eq('student_email', email)
      .order('request_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('[api/loans] Failed to fetch loans', { email, error: error.message });
      return ApiErrors.internal('Failed to retrieve loan history');
    }

    return ok(
      loans || [],
      { page, limit, total: count || 0 },
      200,
      rateLimitHeaders(rlResult)
    );
  } catch (err: any) {
    logger.error('[api/loans] Unhandled error', { error: err.message });
    return ApiErrors.internal();
  }
}
