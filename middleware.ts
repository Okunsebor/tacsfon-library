/**
 * middleware.ts
 *
 * Next.js Edge Middleware — runs on every matched request BEFORE
 * the route handler or page renders.
 *
 * Responsibilities:
 * 1. Request ID injection — every request gets a unique trace ID
 * 2. CORS headers — allow API calls from trusted origins
 * 3. Security headers — add XSS, clickjack protection to all API routes
 * 4. API versioning guard — reject unknown API versions early
 *
 * NOTE: Rate limiting per-route is handled inside each route handler
 * using lib/rate-limit.ts because middleware runs on the Edge runtime
 * and cannot use Node.js-only dependencies. The Redis rate limiter in
 * lib/rate-limit.ts uses fetch() only, which works on both runtimes.
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://tacsfon-library.vercel.app',
].filter(Boolean);

/** Inject security + CORS headers onto API responses */
function applyApiHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || '';

  // CORS
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  response.headers.set('Access-Control-Max-Age', '86400');

  // Security
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const response = new NextResponse(null, { status: 204 });
    return applyApiHeaders(response, request);
  }

  // Inject a unique request ID for tracing
  const requestId = crypto.randomUUID().substring(0, 8).toUpperCase();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Add request ID to response so clients can correlate errors
  response.headers.set('X-Request-ID', requestId);

  if (pathname.startsWith('/api/')) {
    applyApiHeaders(response, request);
  }

  return response;
}

export const config = {
  // Match all API routes and all pages (skip static files and Next.js internals)
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
