import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Checking users...');
  const { data: users } = await supabase.from('users').select('*');
  console.log(`Found ${users?.length} users.`);
  const participants = users?.filter(u => u.role === 'participant') || [];
  console.log(`Found ${participants.length} participants.`);
  console.log('Sample participant:', participants[0]);

  console.log('\nChecking attendance_sessions...');
  const { data: sessions } = await supabase.from('attendance_sessions').select('*').order('openedAt', { ascending: false }).limit(3);
  console.log('Latest sessions:', sessions);

  console.log('\nChecking attendance_pins...');
  const { data: pins, error: pinErr } = await supabase.from('attendance_pins').select('*');
  if (pinErr) console.error('Error fetching pins:', pinErr);
  console.log(`Found ${pins?.length} pins.`);
  console.log('Sample pin:', pins?.[0]);
}

run();
