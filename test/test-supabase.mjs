import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqgcepxnarfgmgnryojc.supabase.co';
const supabaseKey = 'sb_publishable_nIw5m5oBf7sVsS94iZ-CXQ_R31y4fLq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('transactions').select('*').limit(1);
    if (error) {
      console.log('Response error (table may not exist yet, but server reached):', error.message, error.code);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (err) {
    console.error('Connection exception:', err);
  }
}

testConnection();

