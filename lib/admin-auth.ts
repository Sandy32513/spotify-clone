import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

const COOKIE_NAME = 'spotify_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  sub: 'admin';
  exp: number;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.MUSIC_PIPELINE_API_TOKEN ||
    'development-admin-session-secret-change-me'
  );
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionToken() {
  const payload: AdminSessionPayload = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function verifySessionToken(token: string | undefined) {
  if (!token) return false;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;
  if (!safeEqual(signature, signPayload(encodedPayload))) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AdminSessionPayload;
    return payload.sub === 'admin' && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin@123';

  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function setAdminSession(response: NextResponse) {
  const isSecure = process.env.NODE_ENV === 'production' && 
                   process.env.NEXTAUTH_URL?.startsWith('https://');
  // In production with HTTPS, use Secure flag. In development, allow non-secure.
  response.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isSecure,
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
}

export function clearAdminSession(response: NextResponse) {
  const isSecure = process.env.NODE_ENV === 'production' && 
                   process.env.NEXTAUTH_URL?.startsWith('https://');
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isSecure,
    maxAge: 0,
    path: '/',
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}
