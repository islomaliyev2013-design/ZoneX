import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Printer,
  ChevronRight,
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

export default function Reports() {
  const { transactions, settings } = useApp();
  const currency = settings.currency || '$';

  // Filter mode: 'today', 'yesterday', or 'custom'
  const [reportDateMode, setReportDateMode] = useState('today');
  const [customReportDate, setCustomReportDate] = useState(getTodayKey());

  const selectedDateKey =
    reportDateMode === 'today'
      ? getTodayKey()
      : reportDateMode === 'yesterday'
      ? getYesterdayKey()
      : customReportDate;

  // Filter transactions for this exact date
  const dayTransactions = transactions.filter((tx) => tx.dateStr === selectedDateKey);
  const summary = calculateTransactionsSummary(dayTransactions);

  // Total gaming hours calculation
  const totalGamingHoursDecimal = (summary.totalDurationMs / (1000 * 60 * 60)).toFixed(1);
  const totalGamingHoursFormatted = formatDurationHuman(summary.totalDurationMs);

  const handlePrint = () => {
    window.print();
  };

  const metrics = [
    {
      id: 'gaming_income',
      title: 'Total Gaming Income',
      value: formatCurrency(summary.totalGamingIncome, currency),
      subtext: `${totalGamingHoursFormatted} total playtime`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'product_revenue',
      title: 'Total Product Revenue',
      value: formatCurrency(summary.totalProductRevenue, currency),
      subtext: 'Gross merchandise sales',
      icon: ShoppingBag,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'product_costs',
      title: 'Total Product Costs',
      value: formatCurrency(summary.totalProductCosts, currency),
      subtext: 'Cost of goods sold',
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'total_gaming_hours',
      title: 'Total Gaming Hours',
      value: `${totalGamingHoursDecimal} hrs`,
      subtext: `(${totalGamingHoursFormatted}) across stations`,
      icon: Clock,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      id: 'total_profit',
      title: 'Total Profit',
      value: formatCurrency(summary.totalProfit, currency),
      subtext: 'Gaming Income + Product Profit',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      isHero: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Daily Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated accounting summaries strictly calculated from your recorded transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-bold transition"
        >
          <Printer className="w-4 h-4 text-blue-400" />
          Print / Save PDF
        </button>
      </div>

      {/* Date Selection Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Select Report Period:
          </span>

          <button
            type="button"
            onClick={() => setReportDateMode('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportDateMode === 'today'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today ({formatDateDisplay(getTodayKey())})
          </button>

          <button
            type="button"
            onClick={() => setReportDateMode('yesterday')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportDateMode === 'yesterday'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Yesterday ({formatDateDisplay(getYesterdayKey())})
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Pick Date:</span>
            <input
              type="date"
              value={customReportDate}
              onChange={(e) => {
                setCustomReportDate(e.target.value);
                setReportDateMode('custom');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition focus:outline-none ${
                reportDateMode === 'custom'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Reporting for: <span className="font-extrabold text-slate-900">{formatDateDisplay(selectedDateKey)}</span>
        </div>
      </div>

      {/* 5 Required Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isHero = metric.isHero;
          return (
            <div
              key={metric.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between ${
                isHero
                  ? 'sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-white to-emerald-50/60 ring-2 ring-emerald-500/20'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {metric.title}
                  </span>
                  <div
                    className={`mt-2 font-black tracking-tight ${
                      isHero
                        ? 'text-2xl sm:text-3xl text-emerald-600'
                        : 'text-xl sm:text-2xl text-slate-900'
                    }`}
                  >
                    {metric.value}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.bgColor} ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                {metric.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profit Financial Breakdown Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Financial Breakdown for {formatDateDisplay(selectedDateKey)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <span className="text-xs font-bold text-blue-600 uppercase block mb-1">Gaming Operations</span>
            <div className="text-2xl font-black text-blue-900">{formatCurrency(summary.totalGamingIncome, currency)}</div>
            <p className="text-xs text-slate-500 mt-1">100% margin on console time ({totalGamingHoursDecimal} hours)</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
            <span className="text-xs font-bold text-amber-600 uppercase block mb-1">Product Profit Margin</span>
            <div className="text-2xl font-black text-amber-900">
              {formatCurrency(summary.totalProductRevenue - summary.totalProductCosts, currency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Revenue: {formatCurrency(summary.totalProductRevenue, currency)} − Cost: {formatCurrency(summary.totalProductCosts, currency)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-700 uppercase block mb-1">Net Earnings (Total Profit)</span>
            <div className="text-2xl font-black text-emerald-700">{formatCurrency(summary.totalProfit, currency)}</div>
            <p className="text-xs text-slate-500 mt-1">Take-home profit after all merchandise costs</p>
          </div>
        </div>
      </div>

      {/* Transactions on Selected Date */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Transactions on {formatDateDisplay(selectedDateKey)} ({dayTransactions.length})
          </h3>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No transactions were recorded on {formatDateDisplay(selectedDateKey)}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Room & Station</th>
                  <th className="py-2.5 px-3">Playtime</th>
                  <th className="py-2.5 px-3 text-right">Gaming Income</th>
                  <th className="py-2.5 px-3">Products Sold</th>
                  <th className="py-2.5 px-3 text-right">Product Revenue</th>
                  <th className="py-2.5 px-3 text-right">Product Cost</th>
                  <th className="py-2.5 px-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dayTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{tx.timeStr}</td>
                    <td className="py-2.5 px-3 font-semibold">
                      {tx.roomName} {tx.stationName && tx.stationName !== '-' ? `— ${tx.stationName}` : ''}
                    </td>
                    <td className="py-2.5 px-3">
                      {tx.durationMs > 0 ? formatDurationHuman(tx.durationMs) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(tx.gamingPayment, currency)}
                    </td>
                    <td className="py-2.5 px-3">
                      {tx.products?.length > 0
                        ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {formatCurrency(tx.productRevenue, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {formatCurrency(tx.productCost, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600">
                      {formatCurrency(tx.totalProfit, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

