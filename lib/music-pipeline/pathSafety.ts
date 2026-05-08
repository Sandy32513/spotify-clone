import fs from 'fs/promises';
import path from 'path';

const ILLEGAL_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;

export function isInside(parent: string, child: string) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function assertInside(parent: string, child: string) {
  if (!isInside(parent, child)) {
    throw new Error(`Unsafe path outside root: ${child}`);
  }
}

export function sanitizeSegment(value: string | undefined, fallback: string) {
  const normalized = (value ?? fallback)
    .normalize('NFKC')
    .replace(ILLEGAL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '');

  return normalized || fallback;
}

export function normalizeAssetBaseName(title: string) {
  return sanitizeSegment(title, 'Untitled');
}

export async function uniquePath(targetPath: string) {
  const parsed = path.parse(targetPath);
  let candidate = targetPath;
  let counter = 1;

  while (await exists(candidate)) {
    candidate = path.join(parsed.dir, `${parsed.name} (${counter})${parsed.ext}`);
    counter += 1;
  }

  return candidate;
}

export async function exists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

