export const AUDIO_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.flac',
  '.aac',
  '.m4a',
  '.ogg',
  '.wma',
  '.alac',
  '.aiff',
  '.opus',
] as const;

export const ARCHIVE_EXTENSIONS = [
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.tgz',
  '.tar.gz',
] as const;

export const IGNORED_FILENAMES = new Set([
  'thumbs.db',
  'desktop.ini',
  '.ds_store',
]);

export const IGNORED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
  '.pdf',
  '.txt',
  '.nfo',
  '.cue',
  '.log',
  '.m3u',
  '.m3u8',
  '.url',
  '.ini',
  '.db',
  '.tmp',
  '.part',
  '.crdownload',
]);

export const DANGEROUS_EXTENSIONS = new Set([
  '.bat',
  '.cmd',
  '.com',
  '.cpl',
  '.dll',
  '.exe',
  '.hta',
  '.js',
  '.jse',
  '.lnk',
  '.msi',
  '.ps1',
  '.scr',
  '.sh',
  '.vbe',
  '.vbs',
  '.wsf',
]);
