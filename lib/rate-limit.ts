import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 100; // Adjust as needed

/**
 * Rate limiting middleware for Next.js API routes.
 * Uses in-memory store (not suitable for multi-instance deployments).
 * For production, consider using Redis or a database-backed solution.
 */
export function rateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window or expired entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(identifier, entry);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count, resetAt: entry.resetAt };
}

/**
 * Higher-order function to wrap API route handlers with rate limiting.
 */
export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>, identifierFn: (req: NextRequest) => string) {
  return async (req: NextRequest) => {
    const identifier = identifierFn(req);
    const { allowed, remaining, resetAt } = rateLimit(identifier);

    const response = await handler(req);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: response.headers }
      );
    }

    return response;
  };
}
