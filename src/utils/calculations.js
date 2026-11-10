/**
 * Calculate gaming payment given duration in milliseconds and hourly rate
 */
export function calculateGamingPayment(durationMs, hourlyRate) {
  if (!durationMs || durationMs <= 0 || !hourlyRate || hourlyRate <= 0) {
    return 0;
  }
  const hours = durationMs / (1000 * 60 * 60);
  const rawPayment = hours * Number(hourlyRate);
  // Round cleanly to 2 decimal places
  return Math.round(rawPayment * 100) / 100;
}

/**
 * Calculate financial totals for a list of products
 */
export function calculateProductTotals(products = []) {
  return products.reduce(
    (acc, p) => {
      const qty = Number(p.quantity) || 0;
      const purchasePrice = Number(p.purchasePrice) || 0;
      const sellingPrice = Number(p.sellingPrice) || 0;

      const itemCost = qty * purchasePrice;
      const itemRevenue = qty * sellingPrice;
      const itemProfit = itemRevenue - itemCost;

      return {
        totalCost: acc.totalCost + itemCost,
        totalRevenue: acc.totalRevenue + itemRevenue,
        totalProfit: acc.totalProfit + itemProfit,
        totalItemsCount: acc.totalItemsCount + qty,
      };
    },
    {
      totalCost: 0,
      totalRevenue: 0,
      totalProfit: 0,
      totalItemsCount: 0,
    }
  );
}

/**
 * Calculate summary metrics for a list of transactions
 */
export function calculateTransactionsSummary(transactions = []) {
  return transactions.reduce(
    (acc, tx) => {
      const gamingPayment = Number(tx.gamingPayment) || 0;
      const productRevenue = Number(tx.productRevenue) || 0;
      const productCost = Number(tx.productCost) || 0;
      const totalProfit = Number(tx.totalProfit) || 0;
      const durationMs = Number(tx.durationMs) || 0;

      return {
        totalGamingIncome: acc.totalGamingIncome + gamingPayment,
        totalProductRevenue: acc.totalProductRevenue + productRevenue,
        totalProductCosts: acc.totalProductCosts + productCost,
        totalProfit: acc.totalProfit + totalProfit,
        totalDurationMs: acc.totalDurationMs + durationMs,
        count: acc.count + 1,
      };
    },
    {
      totalGamingIncome: 0,
      totalProductRevenue: 0,
      totalProductCosts: 0,
      totalProfit: 0,
      totalDurationMs: 0,
      count: 0,
    }
  );
}

/**
 * Calculate duration in milliseconds from budget and hourly rate
 * @param {number} budget - Money amount
 * @param {number} hourlyRate - Rate per hour
 * @param {number} minimumMs - Minimum duration in ms (optional, defaults to 0)
 * @returns {number} duration in milliseconds
 */
export function calculateDurationFromBudget(budget, hourlyRate, minimumMs = 0) {
  const b = Number(budget) || 0;
  const rate = Number(hourlyRate) || 0;
  if (b <= 0 || rate <= 0) return 0;
  const rawMs = Math.round((b / rate) * 3600 * 1000);
  return Math.max(minimumMs, rawMs);
}

/**
 * Calculate budget from duration in minutes and hourly rate
 * @param {number} durationMinutes - Duration in minutes
 * @param {number} hourlyRate - Rate per hour
 * @returns {number} estimated budget
 */
export function calculateBudgetFromDuration(durationMinutes, hourlyRate) {
  const mins = Number(durationMinutes) || 0;
  const rate = Number(hourlyRate) || 0;
  if (mins <= 0 || rate <= 0) return 0;
  return Math.round((mins / 60) * rate);
}


