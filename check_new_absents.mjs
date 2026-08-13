import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('attendance_records').select('*').eq('status', 'ABSENT').gte('markedAt', '2026-08-13T16:33:00Z');
  console.log('New absent records since 16:33 UTC:', data?.length);
  if (data?.length > 0) {
    console.log(data);
  }
}

run();
