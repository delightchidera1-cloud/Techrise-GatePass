import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('attendance_records')
    .delete()
    .eq('status', 'ABSENT')
    .gte('markedAt', '2026-08-11T00:00:00Z');
  console.log('Nuked recent absent records:', data, error);
}

run();
