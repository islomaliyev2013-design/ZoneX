import { supabase } from '../lib/supabase';

/**
 * Service layer for Supabase operations with safe error handling
 */

// ======================== PROFILES ========================

export async function fetchProfilesFromCloud() {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.warn('Supabase fetchProfiles notice:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetchProfiles network error:', err);
    return null;
  }
}

export async function saveProfileToCloud(profile) {
  try {
    const { error } = await supabase.from('profiles').upsert([
      {
        id: profile.id,
        username: profile.username,
        password: profile.password,
        full_name: profile.fullName,
        email: profile.email,
        role: profile.role || 'user',
        created_at: profile.createdAt || Date.now(),
      },
    ]);
    if (error) {
      console.warn('Supabase saveProfile notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveProfile error:', err);
    return false;
  }
}

// ======================== ROOMS STATE ========================

export async function fetchRoomsStateFromCloud(accountId) {
  try {
    const { data, error } = await supabase
      .from('rooms_state')
      .select('rooms_data')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchRoomsState notice:', error.message);
      return null;
    }
    return data?.rooms_data || null;
  } catch (err) {
    console.warn('Supabase fetchRoomsState network error:', err);
    return null;
  }
}

export async function saveRoomsStateToCloud(accountId, roomsData) {
  try {
    const { error } = await supabase.from('rooms_state').upsert(
      [
        {
          account_id: accountId,
          rooms_data: roomsData,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'account_id' }
    );
    if (error) {
      console.warn('Supabase saveRoomsState notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveRoomsState error:', err);
    return false;
  }
}

// ======================== TRANSACTIONS ========================

export async function fetchTransactionsFromCloud(accountId) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchTransactions notice:', error.message);
      return null;
    }

    if (!data) return [];

    // Map database snake_case columns back to camelCase application models
    return data.map((row) => ({
      id: row.id,
      type: row.type,
      createdAt: Number(row.created_at),
      dateStr: row.date_str,
      timeStr: row.time_str,
      roomId: row.room_id,
      roomName: row.room_name,
      stationId: row.station_id,
      stationName: row.station_name,
      customerName: row.customer_name,
      startTime: row.start_time ? Number(row.start_time) : null,
      endTime: row.end_time ? Number(row.end_time) : null,
      durationMs: Number(row.duration_ms || 0),
      hourlyPrice: Number(row.hourly_price || 0),
      gamingPayment: Number(row.gaming_payment || 0),
      products: Array.isArray(row.products) ? row.products : [],
      productRevenue: Number(row.product_revenue || 0),
      productCost: Number(row.product_cost || 0),
      productProfit: Number(row.product_profit || 0),
      totalProfit: Number(row.total_profit || 0),
      totalPaid: Number(row.total_paid || 0),
    }));
  } catch (err) {
    console.warn('Supabase fetchTransactions network error:', err);
    return null;
  }
}

export async function saveTransactionToCloud(accountId, tx) {
  try {
    const row = {
      id: tx.id,
      account_id: accountId,
      type: tx.type || 'session',
      date_str: tx.dateStr,
      time_str: tx.timeStr,
      room_id: tx.roomId || null,
      room_name: tx.roomName || 'Store',
      station_id: String(tx.stationId || '-'),
      station_name: tx.stationName || '-',
      customer_name: tx.customerName || 'Walk-in',
      start_time: tx.startTime || null,
      end_time: tx.endTime || null,
      duration_ms: tx.durationMs || 0,
      hourly_price: tx.hourlyPrice || 0,
      gaming_payment: tx.gamingPayment || 0,
      products: tx.products || [],
      product_revenue: tx.productRevenue || 0,
      product_cost: tx.productCost || 0,
      product_profit: tx.productProfit || 0,
      total_profit: tx.totalProfit || 0,
      total_paid: tx.totalPaid || 0,
      created_at: tx.createdAt || Date.now(),
    };

    const { error } = await supabase.from('transactions').upsert([row]);
    if (error) {
      console.warn('Supabase saveTransaction notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveTransaction error:', err);
    return false;
  }
}

// ======================== SETTINGS ========================

export async function fetchSettingsFromCloud(accountId) {
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('currency, default_hourly_rate')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchSettings notice:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      currency: data.currency && data.currency !== '$' ? data.currency : "so'm",
      defaultHourlyRate: Number(data.default_hourly_rate) && Number(data.default_hourly_rate) >= 1000 ? Number(data.default_hourly_rate) : 20000,
    };
  } catch (err) {
    console.warn('Supabase fetchSettings network error:', err);
    return null;
  }
}

export async function saveSettingsToCloud(accountId, settings) {
  try {
    const { error } = await supabase.from('business_settings').upsert(
      [
        {
          account_id: accountId,
          currency: settings.currency && settings.currency !== '$' ? settings.currency : "so'm",
          default_hourly_rate: Number(settings.defaultHourlyRate) || 20000,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'account_id' }
    );
    if (error) {
      console.warn('Supabase saveSettings notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveSettings error:', err);
    return false;
  }
}

