import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: records, error } = await supabase.from('attendance_records').select('*').order('markedAt', { ascending: false }).limit(10);
  console.log('RECORDS:', records, error);
}

run();
