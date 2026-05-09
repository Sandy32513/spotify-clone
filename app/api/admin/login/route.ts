import { NextResponse } from 'next/server';
import { verifyAdminCredentials, setAdminSession } from '@/lib/admin-auth';
import { validateCsrfToken } from '@/lib/csrf';
import { adminLoginSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Rate limit by IP
  const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
  const { allowed, remaining } = rateLimit(`admin-login:${clientIP}`);

  if (!allowed) {
    const response = NextResponse.json(
      { authenticated: false, message: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
    response.headers.set('X-RateLimit-Remaining', '0');
    return response;
  }

  const body = await request.json().catch(() => ({}));
  
  // SEC-012: Zod Input Validation
  const parseResult = adminLoginSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { authenticated: false, message: 'Invalid input format.', errors: parseResult.error.flatten() },
      { status: 400 }
    );
  }
  
  const { username, password } = parseResult.data;
  
  // SEC-009: CSRF Validation
  const csrfToken = request.headers.get('x-csrf-token') || body.csrfToken;
  const isCsrfValid = await validateCsrfToken(csrfToken);
  
  if (!isCsrfValid) {
    const response = NextResponse.json(
      { authenticated: false, message: 'Invalid CSRF token. Please refresh the page and try again.' },
      { status: 403 }
    );
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { authenticated: false, message: 'Invalid credentials.' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ authenticated: true });
  setAdminSession(response);
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  return response;
}
