import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { assertInside, sanitizeSegment, uniquePath } from './pathSafety';
import type { PipelineConfig, UploadResult, ValidatedAudioAsset } from './types';

function contentTypeForExtension(extension: string) {
  const ext = extension.toLowerCase();
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.flac') return 'audio/flac';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.aac') return 'audio/aac';
  if (ext === '.ogg') return 'audio/ogg';
  if (ext === '.opus') return 'audio/opus';
  if (ext === '.aiff') return 'audio/aiff';
  if (ext === '.wma') return 'audio/x-ms-wma';
  return 'application/octet-stream';
}

function objectKeyFor(asset: ValidatedAudioAsset, config: PipelineConfig) {
  const artist = sanitizeSegment(asset.metadata.artist, 'Unknown Artist');
  const album = sanitizeSegment(asset.metadata.album, 'Unknown Album');
  const title = sanitizeSegment(asset.metadata.title, 'Untitled');
  return [
    config.supabaseStoragePrefix.replace(/^\/+|\/+$/g, ''),
    artist,
    album,
    `${title}-${asset.checksum.slice(0, 12)}${asset.file.extension}`,
  ].join('/');
}

export async function uploadAsset(asset: ValidatedAudioAsset, config: PipelineConfig): Promise<UploadResult> {
  if (!config.upload || asset.status !== 'valid') {
    return { status: 'skipped', provider: config.cloudProvider };
  }

  if (config.dryRun) {
    return {
      status: 'dry-run',
      provider: config.cloudProvider,
      objectKey: objectKeyFor(asset, config),
      uploadId: asset.checksum,
    };
  }

  if (config.cloudProvider === 'none') {
    return { status: 'skipped', provider: 'none' };
  }

  if (config.cloudProvider === 'local') {
    const target = await uniquePath(path.join(config.localUploadDir, objectKeyFor(asset, config)));
    assertInside(config.localUploadDir, target);
    await fsp.mkdir(path.dirname(target), { recursive: true });
    await fsp.copyFile(asset.file.absolutePath, target);
    return {
      status: 'uploaded',
      provider: 'local',
      objectKey: path.relative(config.localUploadDir, target),
      publicUrl: `file://${target}`,
      secureUrl: `file://${target}`,
      cdnUrl: `file://${target}`,
      uploadId: asset.checksum,
    };
  }

  if (config.cloudProvider === 'supabase') {
    if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
      return {
        status: 'failed',
        provider: 'supabase',
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      };
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
    const objectKey = objectKeyFor(asset, config);
    const body = fs.createReadStream(asset.file.absolutePath);
    const { error } = await supabase.storage
      .from(config.supabaseStorageBucket)
      .upload(objectKey, body, {
        cacheControl: '31536000',
        contentType: contentTypeForExtension(asset.file.extension),
        duplex: 'half',
        upsert: false,
      } as never);

    if (error && !/already exists/i.test(error.message)) {
      return {
        status: 'failed',
        provider: 'supabase',
        objectKey,
        error: error.message,
      };
    }

    const publicUrl = supabase.storage.from(config.supabaseStorageBucket).getPublicUrl(objectKey).data.publicUrl;
    const { data: signedData } = await supabase.storage
      .from(config.supabaseStorageBucket)
      .createSignedUrl(objectKey, 60 * 60 * 24 * 7);

    return {
      status: 'uploaded',
      provider: 'supabase',
      objectKey,
      publicUrl,
      secureUrl: signedData?.signedUrl ?? publicUrl,
      cdnUrl: publicUrl,
      uploadId: asset.checksum,
    };
  }

  return {
    status: 'failed',
    provider: config.cloudProvider,
    error: `Unsupported cloud provider: ${config.cloudProvider}`,
  };
}
