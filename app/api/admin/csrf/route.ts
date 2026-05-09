import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { token, cookieValue } = await generateCsrfToken();
  
  const response = NextResponse.json({ csrfToken: token });
  
  const isSecure = process.env.NODE_ENV === 'production';
  
  response.cookies.set('csrf_token', cookieValue, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecure,
    path: '/',
    maxAge: 3600 // 1 hour validity
  });
  
  return response;
}
