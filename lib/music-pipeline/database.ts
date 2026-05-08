import { createClient } from '@supabase/supabase-js';
import type { DatabaseInsertResult, PipelineConfig, ValidatedAudioAsset } from './types';

export async function insertAssetRecord(
  asset: ValidatedAudioAsset,
  config: PipelineConfig
): Promise<DatabaseInsertResult> {
  if (!config.insertDatabase || asset.status !== 'valid') return { status: 'skipped' };
  if (config.dryRun) return { status: 'dry-run', id: asset.checksum };
  if (config.databaseProvider === 'none') return { status: 'skipped' };

  if (config.databaseProvider !== 'supabase') {
    return { status: 'failed', error: `Unsupported database provider: ${config.databaseProvider}` };
  }

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return {
      status: 'failed',
      error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    };
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const payload = {
    title: asset.metadata.title,
    artist: asset.metadata.artist,
    album: asset.metadata.album,
    genre: asset.metadata.genre ?? null,
    duration: Math.round(asset.metadata.durationSeconds),
    bitrate: asset.metadata.bitrate ? Math.round(asset.metadata.bitrate) : null,
    codec: asset.metadata.codec ?? asset.metadata.container ?? null,
    file_size: asset.file.size,
    original_path: asset.file.absolutePath,
    cloud_url: asset.upload?.secureUrl ?? asset.upload?.publicUrl ?? null,
    cdn_url: asset.upload?.cdnUrl ?? asset.upload?.publicUrl ?? null,
    checksum: asset.checksum,
    uploaded_at: asset.upload?.status === 'uploaded' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('music_assets')
    .upsert(payload, { onConflict: 'checksum' })
    .select('id')
    .single();

  if (error) return { status: 'failed', error: error.message };

  return {
    status: 'inserted',
    id: data?.id,
  };
}

