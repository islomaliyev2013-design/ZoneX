import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://tqgcepxnarfgmgnryojc.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_nIw5m5oBf7sVsS94iZ-CXQ_R31y4fLq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Check Supabase connection and whether the required tables exist
 * Returns: { connected: boolean, tablesReady: boolean, error?: string }
 */
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('transactions').select('id').limit(1);

    if (error) {
      // PGRST205 indicates table does not exist in schema cache
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        return {
          connected: true,
          tablesReady: false,
          error: 'Tables not yet created in Supabase. Run supabase-schema.sql in SQL Editor.',
        };
      }
      return { connected: false, tablesReady: false, error: error.message };
    }

    return { connected: true, tablesReady: true };
  } catch (err) {
    return { connected: false, tablesReady: false, error: err.message };
  }
}

