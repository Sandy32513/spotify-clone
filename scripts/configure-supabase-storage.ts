import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const buckets = [
  {
    id: 'songs',
    public: true,
    fileSizeLimit: '25MB',
    allowedMimeTypes: ['audio/*', 'application/octet-stream'],
  },
  {
    id: 'music-assets',
    public: true,
    fileSizeLimit: '25MB',
    allowedMimeTypes: ['audio/*', 'application/octet-stream'],
  },
  {
    id: 'extracted-files',
    public: false,
    fileSizeLimit: '25MB',
    allowedMimeTypes: ['audio/*', 'application/octet-stream', 'application/json'],
  },
  {
    id: 'temp-uploads',
    public: false,
    fileSizeLimit: '25MB',
    allowedMimeTypes: [
      'audio/*',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-7z-compressed',
      'application/vnd.rar',
      'application/gzip',
      'application/x-tar',
      'application/octet-stream',
    ],
  },
  {
    id: 'user-uploads',
    public: false,
    fileSizeLimit: '25MB',
    allowedMimeTypes: ['audio/*', 'image/*', 'application/octet-stream'],
  },
  {
    id: 'logs',
    public: false,
    fileSizeLimit: '10MB',
    allowedMimeTypes: ['text/plain', 'application/json'],
  },
  {
    id: 'reports',
    public: false,
    fileSizeLimit: '10MB',
    allowedMimeTypes: ['text/plain', 'text/csv', 'application/json'],
  },
];

async function main() {
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  for (const bucket of buckets) {
    const exists = existingBuckets.some((item) => item.name === bucket.id);
    const { error } = exists
      ? await supabase.storage.updateBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes,
        })
      : await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes,
        });

    if (error) throw new Error(`${bucket.id}: ${error.message}`);
    console.log(`${exists ? 'updated' : 'created'} bucket: ${bucket.id}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
