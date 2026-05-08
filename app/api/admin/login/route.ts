import { NextResponse } from 'next/server';
import { setAdminSession, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { authenticated: false, message: 'Please contact administrator for upload access.' },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ authenticated: true });
  setAdminSession(response);
  return response;
}
