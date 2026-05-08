import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  clearAdminSession(response);
  return response;
}
