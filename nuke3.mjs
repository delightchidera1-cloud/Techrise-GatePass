import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hobfehrtufcjgmseatbr.supabase.co';
const supabaseKey = 'sb_publishable_OmEjWzscksODDao76oJMoQ_UnKOgxNQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  let deletedCount = 0;
  while (true) {
    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('status', 'ABSENT')
      .limit(1000);

    if (error) {
      console.error('Error fetching:', error);
      break;
    }

    if (!records || records.length === 0) {
      console.log('No more records to delete.');
      break;
    }

    const idsToDelete = records.map(r => r.id);
    console.log(`Deleting batch of ${idsToDelete.length}...`);
    
    // Delete in batches of 100
    for (let i = 0; i < idsToDelete.length; i += 100) {
      const batch = idsToDelete.slice(i, i + 100);
      const { error: delError } = await supabase.from('attendance_records').delete().in('id', batch);
      if (delError) console.error('Delete error:', delError);
    }
    deletedCount += idsToDelete.length;
  }
  
  console.log(`Cleanup complete. Deleted total: ${deletedCount}`);
}

run();
