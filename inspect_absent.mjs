import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: records, error } = await supabase.from('attendance_records').select('*').eq('studentId', 'tr3/std/jst/004');
  console.log('Total records for student:', records.length);
  const absentRecords = records.filter(r => r.status === 'ABSENT');
  console.log('Total absent:', absentRecords.length);
  if (absentRecords.length > 0) {
    // Check if they have the EXACT same markedAt time or very close
    console.log('Sample absent records:', absentRecords.slice(0, 10));
    
    // Group by markedAt
    const grouped = {};
    absentRecords.forEach(r => {
      const time = r.markedAt.substring(0, 16); // up to minute
      grouped[time] = (grouped[time] || 0) + 1;
    });
    console.log('Absent records grouped by minute:', grouped);
  }
}

run();
