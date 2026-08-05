import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Inserting Superadmin...');
  const { data, error } = await supabase.from('users').upsert({
    studentId: 'SUPERADMIN-001',
    name: 'System Superadmin',
    email: 'chideraawuzie92@gmail.com',
    role: 'superadmin',
    password: '@Delight112'
  }, { onConflict: 'email' });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Superadmin added or updated.');
  }
}

run();
