import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count, error } = await supabase.from('attendance_records').select('*', { count: 'exact', head: true }).eq('status', 'ABSENT');
  console.log('Total absent records:', count);
}

run();
