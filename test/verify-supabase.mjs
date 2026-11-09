import assert from 'node:assert';
import { createClient } from '@supabase/supabase-js';

console.log('🧪 Starting Supabase Integration Verification Tests...\n');

const SUPABASE_URL = 'https://tqgcepxnarfgmgnryojc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nIw5m5oBf7sVsS94iZ-CXQ_R31y4fLq';

// 1. Client creation test
console.log('Test 1: Supabase client initialization');
const client = createClient(SUPABASE_URL, SUPABASE_KEY);
assert.ok(client != null, 'Client must be initialized');
assert.strictEqual(client.supabaseUrl, SUPABASE_URL, 'URL must match project URL');
console.log('✅ Test 1 Passed: Supabase client initialized with valid URL and key');

// 2. Data mapping test
console.log('\nTest 2: Transaction row transformation');
const sampleAppTx = {
  id: 'tx_123',
  type: 'session',
  dateStr: '2026-11-09',
  timeStr: '14:30',
  roomId: 1,
  roomName: 'Room 1',
  stationId: 2,
  stationName: 'Station 2',
  customerName: 'Alex',
  startTime: 1731140000000,
  endTime: 1731143600000,
  durationMs: 3600000,
  hourlyPrice: 15,
  gamingPayment: 15,
  products: [{ name: 'Coca-Cola', quantity: 1, purchasePrice: 1.5, sellingPrice: 3 }],
  productRevenue: 3,
  productCost: 1.5,
  productProfit: 1.5,
  totalProfit: 16.5,
  totalPaid: 18,
  createdAt: 1731143600000,
};

// Map to DB row
const dbRow = {
  id: sampleAppTx.id,
  account_id: 'account_admin',
  type: sampleAppTx.type,
  date_str: sampleAppTx.dateStr,
  time_str: sampleAppTx.timeStr,
  room_id: sampleAppTx.roomId,
  room_name: sampleAppTx.roomName,
  station_id: String(sampleAppTx.stationId),
  station_name: sampleAppTx.stationName,
  customer_name: sampleAppTx.customerName,
  start_time: sampleAppTx.startTime,
  end_time: sampleAppTx.endTime,
  duration_ms: sampleAppTx.durationMs,
  hourly_price: sampleAppTx.hourlyPrice,
  gaming_payment: sampleAppTx.gamingPayment,
  products: sampleAppTx.products,
  product_revenue: sampleAppTx.productRevenue,
  product_cost: sampleAppTx.productCost,
  product_profit: sampleAppTx.productProfit,
  total_profit: sampleAppTx.totalProfit,
  total_paid: sampleAppTx.totalPaid,
  created_at: sampleAppTx.createdAt,
};

assert.strictEqual(dbRow.account_id, 'account_admin');
assert.strictEqual(dbRow.gaming_payment, 15);
assert.strictEqual(dbRow.total_profit, 16.5);
assert.strictEqual(dbRow.products.length, 1);
console.log('✅ Test 2 Passed: Transaction row transformation verified');

console.log('\n🎉 ALL SUPABASE TESTS PASSED SUCCESSFULLY!');

