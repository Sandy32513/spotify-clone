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

  let storageFileId: string | null = null;

  if (asset.upload?.objectKey) {
    const { data: storageFile, error: storageError } = await supabase
      .from('storage_files')
      .upsert(
        {
          bucket_id: config.supabaseStorageBucket,
          object_key: asset.upload.objectKey,
          kind: 'audio',
          provider: config.cloudProvider,
          mime_type: asset.metadata.container ?? null,
          byte_size: asset.file.size,
          checksum: asset.checksum,
          public_url: asset.upload.publicUrl ?? null,
          secure_url: asset.upload.secureUrl ?? null,
          cdn_url: asset.upload.cdnUrl ?? null,
          metadata: {
            original_path: asset.file.absolutePath,
            extension: asset.file.extension,
          },
        },
        { onConflict: 'bucket_id,object_key' }
      )
      .select('id')
      .single();

    if (storageError) return { status: 'failed', error: storageError.message };
    storageFileId = storageFile?.id ?? null;
  }

  const payload = {
    storage_file_id: storageFileId,
    title: asset.metadata.title,
    artist: asset.metadata.artist,
    album: asset.metadata.album,
    genre: asset.metadata.genre ?? null,
    duration: Math.round(asset.metadata.durationSeconds),
    bitrate: asset.metadata.bitrate ? Math.round(asset.metadata.bitrate) : null,
    sample_rate: asset.metadata.sampleRate ?? null,
    channels: asset.metadata.channels ?? null,
    codec: asset.metadata.codec ?? asset.metadata.container ?? null,
    container: asset.metadata.container ?? null,
    lossless: asset.metadata.lossless ?? null,
    file_size: asset.file.size,
    original_path: asset.file.absolutePath,
    cloud_url: asset.upload?.secureUrl ?? asset.upload?.publicUrl ?? null,
    cdn_url: asset.upload?.cdnUrl ?? asset.upload?.publicUrl ?? null,
    checksum: asset.checksum,
    status: asset.upload?.status === 'uploaded' ? 'uploaded' : 'valid',
    metadata: {
      relative_path: asset.file.relativePath,
      discovered_from: asset.file.discoveredFrom,
      archive_source: asset.file.archiveSource,
      near_duplicate_key: asset.nearDuplicateKey,
    },
    uploaded_at: asset.upload?.status === 'uploaded' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('music_assets')
    .upsert(payload, { onConflict: 'checksum' })
    .select('id')
    .single();

  if (error) return { status: 'failed', error: error.message };

  if (asset.upload?.status === 'uploaded') {
    const { error: cloudUploadError } = await supabase
      .from('cloud_uploads')
      .upsert(
        {
          music_asset_id: data?.id ?? null,
          storage_file_id: storageFileId,
          provider: asset.upload.provider,
          bucket_id: config.supabaseStorageBucket,
          object_key: asset.upload.objectKey ?? null,
          status: 'completed',
          public_url: asset.upload.publicUrl ?? null,
          secure_url: asset.upload.secureUrl ?? null,
          cdn_url: asset.upload.cdnUrl ?? null,
          upload_id: asset.upload.uploadId ?? asset.checksum,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'provider,upload_id' }
      );

    if (cloudUploadError) return { status: 'failed', error: cloudUploadError.message };
  }

  return {
    status: 'inserted',
    id: data?.id,
  };
}
