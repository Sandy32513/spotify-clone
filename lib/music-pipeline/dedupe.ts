import { qualityScore } from './metadata';
import type { DuplicateReport, ValidatedAudioAsset } from './types';

export function markDuplicates(assets: ValidatedAudioAsset[]): DuplicateReport {
  const exact = new Map<string, ValidatedAudioAsset[]>();
  const near = new Map<string, ValidatedAudioAsset[]>();

  for (const asset of assets.filter((item) => item.status === 'valid')) {
    exact.set(asset.checksum, [...(exact.get(asset.checksum) ?? []), asset]);
    if (asset.nearDuplicateKey) {
      near.set(asset.nearDuplicateKey, [...(near.get(asset.nearDuplicateKey) ?? []), asset]);
    }
  }

  const exactReport: DuplicateReport['exact'] = [];

  for (const [checksum, group] of Array.from(exact.entries())) {
    if (group.length <= 1) continue;

    const sorted = [...group].sort(
      (a, b) => qualityScore(b.metadata, b.file.size) - qualityScore(a.metadata, a.file.size)
    );
    const kept = sorted[0];
    const duplicates = sorted.slice(1);

    for (const duplicate of duplicates) {
      duplicate.status = 'duplicate';
      duplicate.duplicateOf = kept.file.absolutePath;
      duplicate.reason = 'Exact SHA256 duplicate';
    }

    exactReport.push({
      checksum,
      kept: kept.file.absolutePath,
      duplicates: duplicates.map((asset) => asset.file.absolutePath),
    });
  }

  const nearReport = Array.from(near.entries())
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({
      key,
      paths: group.map((asset) => asset.file.absolutePath),
    }));

  return { exact: exactReport, near: nearReport };
}
