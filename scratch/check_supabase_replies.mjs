import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Querying Supabase table "bouquets"...');
  const { data, error } = await supabase.from('bouquets').select('*');
  if (error) {
    console.error('Error fetching bouquets:', error);
    return;
  }
  console.log(`Found ${data ? data.length : 0} rows in Supabase:`);
  console.log(JSON.stringify(data, null, 2));
}

check();
