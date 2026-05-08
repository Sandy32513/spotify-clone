import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .limit(1);

  console.log('Sample artist row:', data?.[0] ?? 'none');
  console.log('Error:', error?.message);

  // Check actual columns via raw query
  const { data: cols, error: colErr } = await supabase.from('artists').select('*', { head: true });
  console.log('Supabase column metadata:', (cols as any)?.constructor.name);
  console.log('Column error:', colErr?.message);
}

main();

