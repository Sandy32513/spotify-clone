import path from 'path';
import { parseFile } from 'music-metadata';
import { sanitizeSegment } from './pathSafety';
import type { AudioMetadata, FileRecord, ValidatedAudioAsset } from './types';

function fallbackTitle(file: FileRecord) {
  return sanitizeSegment(path.basename(file.filename, file.extension), 'Untitled');
}

export function qualityScore(metadata: AudioMetadata, size: number) {
  const bitrate = metadata.bitrate ?? 0;
  const sampleRate = metadata.sampleRate ?? 0;
  const losslessBonus = metadata.lossless ? 2_000_000 : 0;
  return losslessBonus + bitrate + sampleRate + Math.min(size / 1024, 500_000);
}

export function nearDuplicateKey(metadata: AudioMetadata) {
  const title = metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const artist = metadata.artist.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const durationBucket = Math.round(metadata.durationSeconds / 2) * 2;
  return `${artist}:${title}:${durationBucket}`;
}

export async function validateAudioFile(file: FileRecord, checksum: string): Promise<ValidatedAudioAsset> {
  if (file.size <= 0) {
    return {
      file,
      checksum,
      metadata: {
        title: fallbackTitle(file),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        durationSeconds: 0,
      },
      status: 'corrupted',
      reason: '0-byte file',
    };
  }

  try {
    const parsed = await parseFile(file.absolutePath, { duration: true });
    const durationSeconds = parsed.format.duration ?? 0;

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return {
        file,
        checksum,
        metadata: {
          title: parsed.common.title || fallbackTitle(file),
          artist: parsed.common.artist || 'Unknown Artist',
          album: parsed.common.album || 'Unknown Album',
          genre: parsed.common.genre?.[0],
          durationSeconds: 0,
        },
        status: 'corrupted',
        reason: 'Missing or invalid duration',
      };
    }

    const metadata: AudioMetadata = {
      title: sanitizeSegment(parsed.common.title || fallbackTitle(file), fallbackTitle(file)),
      artist: sanitizeSegment(parsed.common.artist || 'Unknown Artist', 'Unknown Artist'),
      album: sanitizeSegment(parsed.common.album || 'Unknown Album', 'Unknown Album'),
      genre: parsed.common.genre?.[0],
      durationSeconds,
      bitrate: parsed.format.bitrate,
      sampleRate: parsed.format.sampleRate,
      channels: parsed.format.numberOfChannels,
      codec: parsed.format.codec,
      container: parsed.format.container,
      lossless: parsed.format.lossless,
    };

    return {
      file,
      checksum,
      metadata,
      status: 'valid',
      nearDuplicateKey: nearDuplicateKey(metadata),
    };
  } catch (error) {
    return {
      file,
      checksum,
      metadata: {
        title: fallbackTitle(file),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        durationSeconds: 0,
      },
      status: 'corrupted',
      reason: error instanceof Error ? error.message : 'Audio metadata parse failed',
    };
  }
}

