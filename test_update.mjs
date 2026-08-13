import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sessionId = 'ATT-60cd0c1c-6df9-410b-beb2-569972766220-1786629363070';
  const { data, error } = await supabase.from('attendance_sessions').update({ status: 'CLOSED' }).eq('id', sessionId).select();
  console.log('Update result:', data, error);
}

run();
