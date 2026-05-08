import { NextResponse } from 'next/server';
import { verifyAdminCredentials, setAdminSession } from '@/lib/admin-auth';
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
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

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
