import path from 'path';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createPipelineConfig, runMusicPipeline } from '@/lib/music-pipeline';
import { isInside } from '@/lib/music-pipeline/pathSafety';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: 'Please contact administrator for upload access.' },
      { status: 401 }
    );
  }

  const baseConfig = createPipelineConfig();
  const body = await request.json().catch(() => ({}));
  const requestedRoot = body.rootDir ? path.resolve(String(body.rootDir)) : baseConfig.rootDir;

  if (!isInside(baseConfig.rootDir, requestedRoot)) {
    return NextResponse.json(
      { error: 'Requested root must stay inside MUSIC_PIPELINE_ROOT' },
      { status: 400 }
    );
  }

  const { summary, reportDir, config } = await runMusicPipeline({
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
    rootDir: requestedRoot,
    storageProvider: config.cloudProvider,
    databaseProvider: config.databaseProvider,
    totals: summary.totals,
    scan: summary.scan.totals,
    duplicates: summary.duplicates,
    unsupportedFiles: summary.scan.unsupportedFiles.slice(0, 100),
    errors: summary.errors,
  });
}
