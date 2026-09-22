import { createClient } from '@supabase/supabase-js';

const url = 'https://ktldswbrluuxjnpzzfli.supabase.co';
const key = 'sb_publishable_qQT-jHGfFI0gBXXORh1HnA_AeEH0wg1';
const supabase = createClient(url, key);

async function purge() {
  console.log("Fetching bouquets...");
  const { data, error } = await supabase.from('bouquets').select('id, slug');
  console.log(`Found ${data?.length || 0} items. Error:`, error);

  if (data && data.length > 0) {
    for (const b of data) {
      const res = await supabase.from('bouquets').delete().eq('id', b.id);
      console.log(`Deleting ${b.id} (${b.slug}):`, res.error || 'SUCCESS');
    }
  }
}

purge();
