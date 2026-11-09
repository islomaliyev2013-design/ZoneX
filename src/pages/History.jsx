import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Calendar,
  Search,
  Filter,
  Receipt,
  Tv,
  Clock,
  ShoppingBag,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  formatDurationHuman,
  formatDateDisplay,
  getTodayKey,
  getYesterdayKey,
} from '../utils/formatters';
import { calculateTransactionsSummary } from '../utils/calculations';

export default function History() {
  const { transactions, settings } = useApp();
  const currency = settings.currency || '$';

  // Date filter: 'today', 'yesterday', 'all', or 'custom'
  const [dateFilterMode, setDateFilterMode] = useState('all');
  const [customDate, setCustomDate] = useState(getTodayKey());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTxId, setExpandedTxId] = useState(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Date filter
    if (dateFilterMode === 'today') {
      if (tx.dateStr !== getTodayKey()) return false;
    } else if (dateFilterMode === 'yesterday') {
      if (tx.dateStr !== getYesterdayKey()) return false;
    } else if (dateFilterMode === 'custom') {
      if (tx.dateStr !== customDate) return false;
    }

    // Search filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchRoom = (tx.roomName || '').toLowerCase().includes(q);
      const matchStation = (tx.stationName || '').toLowerCase().includes(q);
      const matchCustomer = (tx.customerName || '').toLowerCase().includes(q);
      const matchProducts = (tx.products || []).some((p) =>
        p.name.toLowerCase().includes(q)
      );
      if (!matchRoom && !matchStation && !matchCustomer && !matchProducts) {
        return false;
      }
    }

    return true;
  });

  const summary = calculateTransactionsSummary(filteredTransactions);

  const toggleExpand = (id) => {
    setExpandedTxId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Transaction History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete log of all finished gaming sessions and product sales. Saved permanently in LocalStorage.
        </p>
      </div>

      {/* Filter and Date Bar Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mr-1">
            <Calendar className="w-3.5 h-3.5" /> Date:
          </span>

          <button
            type="button"
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateFilterMode === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Dates ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateFilterMode === 'today'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setDateFilterMode('yesterday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateFilterMode === 'yesterday'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yesterday
          </button>

          {/* Custom Date Input */}
          <div className="flex items-center gap-1.5 pl-1">
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilterMode('custom');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition focus:outline-none ${
                dateFilterMode === 'custom'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search room, station, item..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

      </div>

      {/* Summary of Filtered Results */}
      {filteredTransactions.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-navy-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-bold">
              Showing {filteredTransactions.length} Record{filteredTransactions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Gaming Income:</span>
              <span className="font-extrabold text-white">{formatCurrency(summary.totalGamingIncome, currency)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Product Sales:</span>
              <span className="font-extrabold text-blue-400">{formatCurrency(summary.totalProductRevenue, currency)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Product Costs:</span>
              <span className="font-extrabold text-slate-300">{formatCurrency(summary.totalProductCosts, currency)}</span>
            </div>
            <div>
              <span className="text-emerald-400 block text-[10px] uppercase font-bold">Total Net Profit:</span>
              <span className="font-black text-emerald-400 text-base">{formatCurrency(summary.totalProfit, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Transactions Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {transactions.length === 0
                ? 'Your transaction history is completely fresh and empty. Start and finish a gaming session or record a product sale to see records here.'
                : 'No transactions match the selected date or search filter. Try choosing "All Dates" or changing your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Station</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3 text-right">Gaming Pay</th>
                  <th className="py-3 px-4">Products Sold</th>
                  <th className="py-3 px-3 text-right">Product Rev</th>
                  <th className="py-3 px-3 text-right">Product Cost</th>
                  <th className="py-3 px-4 text-right">Total Profit</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  const hasProducts = tx.products && tx.products.length > 0;
                  const productsSummary = hasProducts
                    ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')
                    : '—';

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-slate-50/70 transition">
                        {/* Date & Time */}
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          <div>{formatDateDisplay(tx.createdAt || tx.dateStr)}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{tx.timeStr}</div>
                        </td>

                        {/* Room */}
                        <td className="py-3 px-3 font-semibold whitespace-nowrap text-slate-900">
                          {tx.roomName || 'Store'}
                        </td>

                        {/* PlayStation Station */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {tx.stationName && tx.stationName !== '-' ? (
                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {tx.stationName}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Gaming Duration */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {tx.durationMs && tx.durationMs > 0 ? (
                            <span className="font-medium text-slate-700">
                              {formatDurationHuman(tx.durationMs)}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Gaming Payment */}
                        <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(tx.gamingPayment, currency)}
                        </td>

                        {/* Products Sold & Quantities */}
                        <td className="py-3 px-4 max-w-xs truncate" title={productsSummary}>
                          <span className={hasProducts ? 'font-medium text-slate-800' : 'text-slate-400'}>
                            {productsSummary}
                          </span>
                        </td>

                        {/* Product Revenue */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                          {formatCurrency(tx.productRevenue, currency)}
                        </td>

                        {/* Product Costs */}
                        <td className="py-3 px-3 text-right text-slate-500 whitespace-nowrap">
                          {formatCurrency(tx.productCost, currency)}
                        </td>

                        {/* Total Profit */}
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                          {formatCurrency(tx.totalProfit, currency)}
                        </td>

                        {/* Expand Receipt */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleExpand(tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                            title="Toggle receipt breakdown"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Receipt Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={10} className="p-4">
                            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                <div className="text-xs font-bold text-slate-800">
                                  Transaction Receipt #{tx.id.slice(-6)} • Customer: {tx.customerName || 'Walk-in'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Total Collected: <span className="font-bold text-slate-900">{formatCurrency(tx.totalPaid || (tx.gamingPayment + tx.productRevenue), currency)}</span>
                                </div>
                              </div>

                              {/* Products itemized table */}
                              {hasProducts ? (
                                <div>
                                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Itemized Products
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                    {tx.products.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
                                      >
                                        <div className="font-bold text-slate-900">
                                          {item.quantity}x {item.name}
                                        </div>
                                        <div className="text-slate-500 text-[11px] mt-1 flex justify-between">
                                          <span>Buy: {formatCurrency(item.purchasePrice, currency)}</span>
                                          <span>Sell: {formatCurrency(item.sellingPrice, currency)}</span>
                                        </div>
                                        <div className="text-emerald-600 font-bold text-[11px] mt-0.5 text-right">
                                          Profit: {formatCurrency(item.profit || (item.totalRevenue - item.totalCost), currency)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No products sold in this transaction.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

