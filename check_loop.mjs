import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: openSessions, error: openError } = await supabase.from('attendance_sessions').select('*').eq('status', 'OPEN');
  console.log('Total OPEN sessions:', openSessions?.length);
  
  const { data: records, error } = await supabase.from('attendance_records').select('id, studentId, status, markedAt').eq('status', 'ABSENT');
  console.log('Total ABSENT records:', records?.length);
  
  if (records?.length > 0) {
    const sorted = records.sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt));
    console.log('Newest 5 absent records:', sorted.slice(0, 5));
  }
}

run();
