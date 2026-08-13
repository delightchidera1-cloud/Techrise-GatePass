import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('attendance_records').select('*').eq('studentId', 'tr3/std/jst/004').eq('status', 'ABSENT');
  console.log('Total absent for student:', data?.length);
  if (data?.length > 0) {
    console.log(data.slice(0, 5));
  }
}

run();
