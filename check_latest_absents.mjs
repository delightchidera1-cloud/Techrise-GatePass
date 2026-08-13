import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('attendance_records').select('studentId, markedAt').eq('status', 'ABSENT').order('markedAt', { ascending: false }).limit(20);
  console.log('Most recent absent records:', data);
}

run();
