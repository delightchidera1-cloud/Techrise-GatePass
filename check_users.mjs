import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('users').select('*').eq('role', 'participant');
  if (data) {
    console.log(data.map(u => ({ name: u.name, studentId: u.studentId, assignedTutorId: u.assignedTutorId })));
  }
}
run();
