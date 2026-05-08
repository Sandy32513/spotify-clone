import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createPipelineConfig, runMusicPipeline } from '@/lib/music-pipeline';
import { ARCHIVE_EXTENSIONS, AUDIO_EXTENSIONS, DANGEROUS_EXTENSIONS } from '@/lib/music-pipeline/constants';
import { assertInside, sanitizeSegment } from '@/lib/music-pipeline/pathSafety';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SINGLE_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_BATCH_UPLOAD_BYTES = 1024 * 1024 * 1024;

function extensionFor(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.tar.gz')) return '.tar.gz';
  return path.extname(lower);
}

function isAcceptedUpload(filePath: string) {
  const extension = extensionFor(filePath);
  return AUDIO_EXTENSIONS.includes(extension as never) || ARCHIVE_EXTENSIONS.includes(extension as never);
}

function isDangerousUpload(filePath: string) {
  return DANGEROUS_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function relativeTargetPath(relativePath: string | undefined, fallbackName: string) {
  const source = (relativePath || fallbackName).replace(/\\/g, '/');
  const parts = source
    .split('/')
    .filter(Boolean)
    .map((segment, index, all) => {
      const fallback = index === all.length - 1 ? fallbackName : 'Folder';
      return sanitizeSegment(segment, fallback);
    })
    .filter((segment) => segment !== '.' && segment !== '..');

  if (parts.length === 0) return sanitizeSegment(fallbackName, 'upload.bin');
  return path.join(...parts);
}

function summarizeFile(assetPath: string, fileSize: number, reason: string) {
  return {
    path: assetPath,
    size: fileSize,
    status: 'rejected',
    reason,
  };
}

export async function POST(request: Request) {
  // Rate limiting: 5 uploads per hour per IP
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   request.headers.get('x-real-ip') || 
                   'anonymous';
  const { allowed, remaining } = rateLimit(`admin-upload:${clientIP}`);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Upload limit exceeded. Maximum 5 batches per hour.' },
      { status: 429 }
    );
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: 'Please contact administrator for upload access.' },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
  const relativePaths = formData.getAll('relativePaths').map((entry) => String(entry));

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files were provided.' }, { status: 400 });
  }

  const rejected = [];
  const accepted = [];
  let acceptedBytes = 0;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const relativePath = relativePaths[index] || file.name;

    if (file.size > MAX_SINGLE_UPLOAD_BYTES) {
      rejected.push(summarizeFile(relativePath, file.size, 'File exceeds 25 MB single-upload limit'));
      continue;
    }

    if (isDangerousUpload(relativePath) || isDangerousUpload(file.name)) {
      rejected.push(summarizeFile(relativePath, file.size, 'Executable or script uploads are blocked'));
      continue;
    }

    if (!isAcceptedUpload(relativePath) && !isAcceptedUpload(file.name)) {
      rejected.push(summarizeFile(relativePath, file.size, 'Unsupported file format'));
      continue;
    }

    acceptedBytes += file.size;
    accepted.push({ file, relativePath });
  }

  if (acceptedBytes > MAX_BATCH_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: 'Batch exceeds 1 GB upload limit.', rejected },
      { status: 413 }
    );
  }

  if (accepted.length === 0) {
    return NextResponse.json(
      { error: 'No supported audio or archive files were accepted.', rejected },
      { status: 400 }
    );
  }

  const baseConfig = createPipelineConfig();
  const uploadId = crypto.randomUUID();
  const stagingDir = path.join(baseConfig.workDir, 'admin-uploads', uploadId);
  const incomingDir = path.join(stagingDir, 'incoming');
  assertInside(baseConfig.workDir, stagingDir);
  await fs.mkdir(incomingDir, { recursive: true });

  for (const item of accepted) {
    const target = path.join(incomingDir, relativeTargetPath(item.relativePath, item.file.name));
    assertInside(incomingDir, target);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await item.file.arrayBuffer()));
  }

   const { summary, reportDir, config } = await runMusicPipeline({
     ...baseConfig,
     rootDir: incomingDir,
     workDir: path.join(stagingDir, '.music-pipeline'),
     extractionDir: path.join(stagingDir, '.music-pipeline', 'extracted'),
     reportsDir: path.join(baseConfig.reportsDir, 'admin-uploads'),
     organizedDir: path.join(stagingDir, 'Organized'),
     corruptedDir: path.join(stagingDir, 'Corrupted'),
     dryRun: false,
     extractArchives: true,
     organize: false,
     moveCorrupted: true,
     upload: true,
     insertDatabase: true,
   });

   const response = NextResponse.json({
     uploadId,
     reportDir,
     rejected,
     storageProvider: config.cloudProvider,
     databaseProvider: config.databaseProvider,
     totals: summary.totals,
     scan: summary.scan.totals,
     duplicates: summary.duplicates,
     files: summary.assets.map((asset) => ({
       name: asset.file.filename,
       path: asset.file.relativePath,
       status: asset.status,
       reason: asset.reason,
       title: asset.metadata.title,
       artist: asset.metadata.artist,
       album: asset.metadata.album,
       durationSeconds: asset.metadata.durationSeconds,
       bitrate: asset.metadata.bitrate,
       codec: asset.metadata.codec ?? asset.metadata.container,
       fileSize: asset.file.size,
       checksum: asset.checksum,
       duplicateOf: asset.duplicateOf,
       upload: asset.upload,
       database: asset.database,
     })),
     unsupportedFiles: summary.scan.unsupportedFiles.map((file) => ({
       name: file.filename,
       path: file.relativePath,
       size: file.size,
     })),
     errors: summary.errors,
     warnings: [
       config.cloudProvider === 'none' ? 'MUSIC_PIPELINE_CLOUD_PROVIDER is none; cloud upload was skipped.' : null,
       config.databaseProvider === 'none' ? 'MUSIC_PIPELINE_DATABASE_PROVIDER is none; database insert was skipped.' : null,
     ].filter(Boolean),
   });

    // Add rate limit headers
    const { remaining: finalRemaining } = rateLimit(`admin-upload:${clientIP}`);
    response.headers.set('X-RateLimit-Remaining', finalRemaining.toString());
    return response;
  }
