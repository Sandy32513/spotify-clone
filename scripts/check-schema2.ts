import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Direct Postgres query via RPC
  const { data, error } = await supabase.rpc('pg_catalog.pg_get_expr', {
    objid: 'artists'::regclass
  });
  console.log('RPC result:', data, error);

  // OR try a raw SQL via query (client doesn't expose raw)
  // Use a workaround: select from information_schema using a Postgres function
  // Actually supabase-js v2 doesn't have .query(). Use rpc
}
main();
