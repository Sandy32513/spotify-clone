import { NextResponse } from 'next/server';

export async function GET() {
  const protocol = process.env.NODE_ENV === 'production' ? 'wss:' : 'ws:';
  const wsHost = process.env.NEXT_PUBLIC_WS_URL || `${protocol}://localhost:3001`;

  return NextResponse.json({
    wsUrl: wsHost,
    status: 'ok',
  });
}
