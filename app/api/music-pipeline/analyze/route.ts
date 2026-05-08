import path from 'path';
import { NextResponse } from 'next/server';
import { createPipelineConfig, runMusicPipeline } from '@/lib/music-pipeline';
import { isInside } from '@/lib/music-pipeline/pathSafety';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bearerToken(request: Request) {
  const header = request.headers.get('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) return header.slice('bearer '.length);
  return request.headers.get('x-pipeline-token');
}

export async function POST(request: Request) {
  const baseConfig = createPipelineConfig();
  const token = bearerToken(request);

  if (!baseConfig.apiToken || token !== baseConfig.apiToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedRoot = body.rootDir ? path.resolve(String(body.rootDir)) : baseConfig.rootDir;

  if (!isInside(baseConfig.rootDir, requestedRoot)) {
    return NextResponse.json(
      { error: 'Requested root must stay inside MUSIC_PIPELINE_ROOT' },
      { status: 400 }
    );
  }

  const { summary, reportDir } = await runMusicPipeline({
    ...baseConfig,
    rootDir: requestedRoot,
    dryRun: true,
    extractArchives: false,
    organize: false,
    moveCorrupted: false,
    upload: false,
    insertDatabase: false,
  });

  return NextResponse.json({
    reportDir,
    totals: summary.totals,
    scan: summary.scan.totals,
    errors: summary.errors,
  });
}

