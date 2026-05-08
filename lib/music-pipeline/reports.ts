import fs from 'fs/promises';
import path from 'path';
import type { PipelineSummary, ValidatedAudioAsset } from './types';

function csvEscape(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function assetsToCsv(assets: ValidatedAudioAsset[]) {
  const headers = [
    'status',
    'title',
    'artist',
    'album',
    'duration_seconds',
    'bitrate',
    'codec',
    'file_size',
    'checksum',
    'original_path',
    'cloud_url',
    'reason',
  ];

  const rows = assets.map((asset) => [
    asset.status,
    asset.metadata.title,
    asset.metadata.artist,
    asset.metadata.album,
    asset.metadata.durationSeconds,
    asset.metadata.bitrate,
    asset.metadata.codec,
    asset.file.size,
    asset.checksum,
    asset.file.absolutePath,
    asset.upload?.publicUrl ?? asset.upload?.secureUrl ?? asset.upload?.cdnUrl,
    asset.reason,
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

function summaryToText(summary: PipelineSummary) {
  return [
    'Music Pipeline Final Summary',
    '============================',
    `Root: ${summary.rootDir}`,
    `Started: ${summary.startedAt}`,
    `Completed: ${summary.completedAt}`,
    `Dry run: ${summary.dryRun}`,
    '',
    `Total files: ${summary.scan.totals.files}`,
    `Audio discovered: ${summary.totals.discoveredAudio}`,
    `Archives discovered: ${summary.scan.totals.archives}`,
    `Validated audio: ${summary.totals.validatedAudio}`,
    `Corrupted audio: ${summary.totals.corruptedAudio}`,
    `Exact duplicates: ${summary.totals.exactDuplicates}`,
    `Near duplicate groups: ${summary.totals.nearDuplicateGroups}`,
    `Uploaded: ${summary.totals.uploaded}`,
    `Database inserted: ${summary.totals.databaseInserted}`,
    `Errors: ${summary.errors.length}`,
  ].join('\n');
}

export async function writeReports(summary: PipelineSummary, reportsDir: string) {
  await fs.mkdir(reportsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(reportsDir, stamp);
  await fs.mkdir(runDir, { recursive: true });

  await fs.writeFile(path.join(runDir, 'final-summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  await fs.writeFile(path.join(runDir, 'final-summary.txt'), summaryToText(summary), 'utf8');
  await fs.writeFile(path.join(runDir, 'music-assets.csv'), assetsToCsv(summary.assets), 'utf8');
  await fs.writeFile(path.join(runDir, 'extraction-report.json'), JSON.stringify(summary.extraction, null, 2), 'utf8');
  await fs.writeFile(path.join(runDir, 'duplicate-report.json'), JSON.stringify(summary.duplicates, null, 2), 'utf8');
  await fs.writeFile(
    path.join(runDir, 'corrupted-files.json'),
    JSON.stringify(summary.assets.filter((asset) => asset.status === 'corrupted'), null, 2),
    'utf8'
  );
  await fs.writeFile(path.join(runDir, 'unsupported-files.json'), JSON.stringify(summary.scan.unsupportedFiles, null, 2), 'utf8');
  await fs.writeFile(
    path.join(runDir, 'upload-report.json'),
    JSON.stringify(summary.assets.map((asset) => ({ path: asset.file.absolutePath, upload: asset.upload })), null, 2),
    'utf8'
  );
  await fs.writeFile(
    path.join(runDir, 'database-insert-report.json'),
    JSON.stringify(summary.assets.map((asset) => ({ path: asset.file.absolutePath, database: asset.database })), null, 2),
    'utf8'
  );

  return runDir;
}

