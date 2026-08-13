import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: records, error } = await supabase.from('attendance_records').select('id, studentId, status, markedAt').eq('status', 'ABSENT');
  if (error) {
    console.error(error);
    return;
  }
  
  // Group by studentId and minute to find duplicates
  const grouped = {};
  records.forEach(r => {
    const key = `${r.studentId}-${r.markedAt.substring(0, 16)}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });
  
  const toDelete = [];
  for (const key in grouped) {
    const group = grouped[key];
    if (group.length > 1) {
      // Keep the first one, delete the rest
      const duplicates = group.slice(1).map(r => r.id);
      toDelete.push(...duplicates);
    }
  }
  
  console.log(`Found ${toDelete.length} duplicate absent records to delete.`);
  
  if (toDelete.length > 0) {
    // Delete in chunks of 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const chunk = toDelete.slice(i, i + 100);
      await supabase.from('attendance_records').delete().in('id', chunk);
      console.log(`Deleted chunk ${i} to ${i + chunk.length}`);
    }
  }
}

run();
