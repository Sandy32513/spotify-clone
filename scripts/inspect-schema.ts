import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Check if we can get the table definition via pg_tables
  const { data, error } = await supabase.rpc('pg_catalog.pg_table_def', {
    table_name: 'artists'
  });
  console.log('Columns:', data);
  console.log('Error:', error?.message);
  
  // Or try a direct SELECT and inspect keys
  const { data: row } = await supabase.from('artists').select('*').limit(1).maybeSingle();
  console.log('Row keys:', row ? Object.keys(row) : 'no row');
}
main();
