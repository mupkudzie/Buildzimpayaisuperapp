import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egbemzhcmpogafcfskcu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnYmVtemhjbXBvZ2FmY2Zza2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzIxOTcsImV4cCI6MjA5MTkwODE5N30.j5KpnbZbpfnli5NHJ6iuZXUyF0jUJ4owMpYyV-6vxDE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: appState, error: appError } = await supabase.from('app_state').select('*');
  console.log('App State:', appState, appError);

  const { data: devices, error: devError } = await supabase.from('devices').select('*');
  console.log('Devices Table:', devices, devError);

  const { data: registry, error: regError } = await supabase.from('device_registry').select('*');
  console.log('Device Registry Table:', registry, regError);
}

check();
