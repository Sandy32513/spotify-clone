import fs from 'fs/promises';
import path from 'path';
import { assertInside, sanitizeSegment, uniquePath } from './pathSafety';
import type { PipelineConfig, ValidatedAudioAsset } from './types';

async function moveFile(source: string, target: string) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    await fs.rename(source, target);
  } catch {
    await fs.copyFile(source, target);
    await fs.unlink(source);
  }
}

export function organizedTargetFor(asset: ValidatedAudioAsset, config: PipelineConfig) {
  const artist = sanitizeSegment(asset.metadata.artist, 'Unknown Artist');
  const album = sanitizeSegment(asset.metadata.album, 'Unknown Album');
  const title = sanitizeSegment(asset.metadata.title, path.basename(asset.file.filename, asset.file.extension));
  const target = path.join(config.organizedDir, artist, album, `${title}${asset.file.extension}`);
  assertInside(config.organizedDir, target);
  return target;
}

export async function organizeAssets(assets: ValidatedAudioAsset[], config: PipelineConfig) {
  if (!config.organize) return;

  for (const asset of assets) {
    if (asset.status !== 'valid') continue;
    const target = await uniquePath(organizedTargetFor(asset, config));
    asset.organizedPath = target;
    if (!config.dryRun) {
      await moveFile(asset.file.absolutePath, target);
      asset.file.absolutePath = target;
    }
  }
}

export async function moveCorruptedAssets(assets: ValidatedAudioAsset[], config: PipelineConfig) {
  if (!config.moveCorrupted) return;

  for (const asset of assets) {
    if (asset.status !== 'corrupted') continue;
    const target = await uniquePath(path.join(config.corruptedDir, asset.file.filename));
    assertInside(config.corruptedDir, target);
    asset.organizedPath = target;
    if (!config.dryRun) {
      await moveFile(asset.file.absolutePath, target);
      asset.file.absolutePath = target;
    }
  }
}

