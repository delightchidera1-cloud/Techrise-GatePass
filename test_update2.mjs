import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: openSessions } = await supabase.from('attendance_sessions').select('*').eq('status', 'OPEN');
  console.log('Open sessions:', openSessions);
  if (openSessions && openSessions.length > 0) {
    const sid = openSessions[0].id;
    console.log('Attempting to close:', sid);
    const { data, error } = await supabase.from('attendance_sessions').update({ status: 'CLOSED' }).eq('id', sid).select();
    console.log('Update result:', data, error);
  }
}

run();
