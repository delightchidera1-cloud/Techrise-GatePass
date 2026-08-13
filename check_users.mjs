import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error } = await supabase.from('users').select('*');
  console.log('USERS:', users.map(u => ({ id: u.id, role: u.role, name: u.name, assignedTutorId: u.assignedTutorId, assignedClass: u.assignedClass })));
}

run();
