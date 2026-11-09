import assert from 'node:assert';
import {
  calculateGamingPayment,
  calculateProductTotals,
  calculateTransactionsSummary,
} from '../src/utils/calculations.js';
import {
  generateInitialRooms,
  INITIAL_ROOMS_COUNT,
  STATIONS_PER_ROOM,
} from '../src/utils/storage.js';
import {
  formatCurrency,
  formatTimer,
  formatDurationHuman,
  toDateKey,
} from '../src/utils/formatters.js';

console.log('🧪 Starting PlayStation Manager Verification Tests...\n');

// 1. Initial Rooms Test
console.log('Test 1: Initial Rooms & Stations generation');
const rooms = generateInitialRooms();
assert.strictEqual(rooms.length, INITIAL_ROOMS_COUNT, 'Must have exactly 5 rooms');
assert.strictEqual(INITIAL_ROOMS_COUNT, 5, 'INITIAL_ROOMS_COUNT must be 5');
assert.strictEqual(STATIONS_PER_ROOM, 5, 'STATIONS_PER_ROOM must be 5');

let totalStationsCount = 0;
rooms.forEach((room, rIdx) => {
  assert.strictEqual(room.stations.length, 5, `Room ${rIdx + 1} must have 5 stations`);
  assert.strictEqual(room.name, `Room ${rIdx + 1}`);
  room.stations.forEach((st, sIdx) => {
    totalStationsCount++;
    assert.strictEqual(st.status, 'available', 'Initial status must be available');
    assert.strictEqual(st.session, null, 'Initial session must be null');
    assert.strictEqual(st.stationName, `Station ${sIdx + 1}`);
  });
});
assert.strictEqual(totalStationsCount, 25, 'Total stations must be exactly 25');
console.log('✅ Test 1 Passed: 5 rooms, 25 stations verified');

// 2. Gaming Calculation Test
console.log('\nTest 2: Gaming payment calculations');
const hourMs = 3600 * 1000;
// 1 hour at $20/hr
assert.strictEqual(calculateGamingPayment(hourMs, 20), 20);
// 1.5 hours at $20/hr
assert.strictEqual(calculateGamingPayment(1.5 * hourMs, 20), 30);
// 15 mins (0.25h) at $20/hr
assert.strictEqual(calculateGamingPayment(0.25 * hourMs, 20), 5);
// 0 hours
assert.strictEqual(calculateGamingPayment(0, 20), 0);
console.log('✅ Test 2 Passed: Gaming payment calculations accurate');

// 3. Product Calculations Test
console.log('\nTest 3: Product sales calculations');
const testProducts = [
  { name: 'Semichka', quantity: 1, purchasePrice: 1.0, sellingPrice: 2.0 },
  { name: 'Coca-Cola', quantity: 1, purchasePrice: 1.5, sellingPrice: 3.0 },
];
const prodTotals = calculateProductTotals(testProducts);
assert.strictEqual(prodTotals.totalRevenue, 5.0, 'Total revenue must be $5.00');
assert.strictEqual(prodTotals.totalCost, 2.5, 'Total cost must be $2.50');
assert.strictEqual(prodTotals.totalProfit, 2.5, 'Total profit must be $2.50');
assert.strictEqual(prodTotals.totalItemsCount, 2, 'Total items count must be 2');
console.log('✅ Test 3 Passed: Product sales totals match user example');

// 4. Combined Transaction Summary Test
console.log('\nTest 4: Combined Transaction Summary');
const mockTransactions = [
  {
    id: 'tx_1',
    dateStr: '2026-11-09',
    durationMs: hourMs,
    gamingPayment: 20,
    productRevenue: 5,
    productCost: 2.5,
    totalProfit: 22.5, // 20 + 2.5
  },
  {
    id: 'tx_2',
    dateStr: '2026-11-09',
    durationMs: 2 * hourMs,
    gamingPayment: 30,
    productRevenue: 10,
    productCost: 4,
    totalProfit: 36, // 30 + 6
  },
];
const txSummary = calculateTransactionsSummary(mockTransactions);
assert.strictEqual(txSummary.totalGamingIncome, 50, 'Total gaming income must be 50');
assert.strictEqual(txSummary.totalProductRevenue, 15, 'Total product revenue must be 15');
assert.strictEqual(txSummary.totalProductCosts, 6.5, 'Total product costs must be 6.5');
assert.strictEqual(txSummary.totalProfit, 58.5, 'Total profit must be 58.5 (50 + 8.5)');
assert.strictEqual(txSummary.totalDurationMs, 3 * hourMs, 'Total duration must be 3 hours');
console.log('✅ Test 4 Passed: Combined transaction summary verified');

// 5. Formatters Test
console.log('\nTest 5: Formatters');
assert.strictEqual(formatCurrency(15), "15 so'm");
assert.strictEqual(formatCurrency(25000), "25 000 so'm");
assert.strictEqual(formatTimer(3665 * 1000), '01:01:05');
assert.strictEqual(formatDurationHuman(3665 * 1000), '1h 1m');
assert.strictEqual(formatDurationHuman(45 * 60 * 1000), '45m');
console.log('✅ Test 5 Passed: Formatters output as expected');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');

