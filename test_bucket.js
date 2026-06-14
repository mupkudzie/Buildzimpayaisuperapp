import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytaiazaklabveeksxhhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YWlhemFrbGFidmVla3N4aGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjg0MTUsImV4cCI6MjA5MDc0NDQxNX0.mlyVb19toNBeifNcwd5gGtaryJCnj-K5Ajk3_e_zGxc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.storage.from('videos').list();
  if (error) {
    console.error('Error fetching files:', error);
  } else {
    console.log('Successfully fetched files:', data.map(f => f.name));
  }
}

test();
