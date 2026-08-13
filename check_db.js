import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: records, error: err1 } = await supabase.from('attendance_records').select('*');
  console.log('RECORDS:', records, err1);
  const { data: sessions, error: err2 } = await supabase.from('attendance_sessions').select('*');
  console.log('SESSIONS:', sessions, err2);
  const { data: pins, error: err3 } = await supabase.from('attendance_pins').select('*');
  console.log('PINS:', pins, err3);
}

run();
