/**
 * lib/api-response.ts
 *
 * Standardized API response builder for all /api/v1/ route handlers.
 *
 * Every response from the library API has the same envelope shape:
 *   { success, data?, error?, meta? }
 *
 * This means API consumers (future mobile apps, integrations) have a
 * single contract to code against and never encounter surprise shapes.
 */

import { NextResponse } from 'next/server';

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  cached?: boolean;
  requestId?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Standard headers attached to every API response */
const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'X-Powered-By': 'TACSFON-Library',
  'X-API-Version': 'v1',
};

/** Build a successful JSON response */
export function ok<T>(
  data: T,
  meta?: ApiMeta,
  status = 200,
  extraHeaders?: Record<string, string>
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status, headers: { ...BASE_HEADERS, ...extraHeaders } }
  );
}

/** Build an error JSON response */
export function err(
  message: string,
  status = 500,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: message, ...(code ? { code } : {}) },
    { status, headers: BASE_HEADERS }
  );
}

/** Shorthand error constructors for common status codes */
export const ApiErrors = {
  badRequest: (msg = 'Bad request') => err(msg, 400, 'BAD_REQUEST'),
  unauthorized: (msg = 'Authentication required') => err(msg, 401, 'UNAUTHORIZED'),
  forbidden: (msg = 'Access denied') => err(msg, 403, 'FORBIDDEN'),
  notFound: (msg = 'Resource not found') => err(msg, 404, 'NOT_FOUND'),
  tooManyRequests: (msg = 'Rate limit exceeded. Please slow down.') => err(msg, 429, 'RATE_LIMITED'),
  internal: (msg = 'An unexpected server error occurred') => err(msg, 500, 'INTERNAL_ERROR'),
  serviceUnavailable: (msg = 'Service temporarily unavailable') => err(msg, 503, 'SERVICE_UNAVAILABLE'),
};

/** Parse pagination from URL search params (with safe defaults and caps) */
export function parsePagination(searchParams: URLSearchParams): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/** Generate a short request ID for tracing */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
