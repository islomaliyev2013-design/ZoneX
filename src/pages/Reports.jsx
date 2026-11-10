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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  const [reportDateMode, setReportDateMode] = useState('today');
  const [customReportDate, setCustomReportDate] = useState(getTodayKey());

  const selectedDateKey =
    reportDateMode === 'today'
      ? getTodayKey()
      : reportDateMode === 'yesterday'
      ? getYesterdayKey()
      : customReportDate;

  const dayTransactions = transactions.filter((tx) => tx.dateStr === selectedDateKey);
  const summary = calculateTransactionsSummary(dayTransactions);

  const totalGamingHoursDecimal = (summary.totalDurationMs / (1000 * 60 * 60)).toFixed(1);
  const totalGamingHoursFormatted = formatDurationHuman(summary.totalDurationMs);

  const handlePrint = () => {
    window.print();
  };

  const metrics = [
    {
      id: 'gaming_income',
      title: t('reports.totalGamingIncome'),
      value: formatCurrency(summary.totalGamingIncome, currency),
      subtext: t('reports.totalPlaytimeSubtext', { time: totalGamingHoursFormatted }),
      icon: Clock,
      color: 'text-brand-purpleLight',
      bgColor: 'bg-brand-purple/15 border-brand-purple/30',
    },
    {
      id: 'product_revenue',
      title: t('reports.totalProductRevenue'),
      value: formatCurrency(summary.totalProductRevenue, currency),
      subtext: t('reports.grossSalesSubtext'),
      icon: ShoppingBag,
      color: 'text-brand-lavender',
      bgColor: 'bg-brand-purple/15 border-brand-purple/30',
    },
    {
      id: 'product_costs',
      title: t('reports.totalProductCosts'),
      value: formatCurrency(summary.totalProductCosts, currency),
      subtext: t('reports.costOfGoodsSubtext'),
      icon: DollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800/40',
    },
    {
      id: 'total_gaming_hours',
      title: t('reports.totalGamingHours'),
      value: `${totalGamingHoursDecimal} hrs`,
      subtext: t('reports.acrossStationsSubtext', { time: totalGamingHoursFormatted }),
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40 border-cyan-800/40',
    },
    {
      id: 'total_profit',
      title: t('reports.totalProfit'),
      value: formatCurrency(summary.totalProfit, currency),
      subtext: t('reports.gamingPlusProductSubtext'),
      icon: TrendingUp,
      color: 'text-gaming-green',
      bgColor: 'bg-gaming-greenBg border-gaming-green/30',
      isHero: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('reports.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('reports.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-midnight-card hover:bg-midnight-hover text-slate-200 border border-midnight-border text-xs font-bold transition"
        >
          <Printer className="w-4 h-4 text-brand-purpleLight" />
          {t('reports.printPdf')}
        </button>
      </div>

      {/* Date Selection Bar */}
      <div className="bg-midnight-card rounded-2xl p-5 shadow-xl border border-midnight-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-brand-purpleLight" /> {t('reports.selectReportPeriod')}
          </span>

          <button
            type="button"
            onClick={() => setReportDateMode('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportDateMode === 'today'
                ? 'bg-brand-purple text-slate-950 font-black shadow-md shadow-[#06B6D4]/30'
                : 'bg-midnight-bg text-slate-300 hover:bg-midnight-hover border border-midnight-border'
            }`}
          >
            {t('reports.todayBtn', { date: formatDateDisplay(getTodayKey()) })}
          </button>

          <button
            type="button"
            onClick={() => setReportDateMode('yesterday')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportDateMode === 'yesterday'
                ? 'bg-brand-purple text-slate-950 font-black shadow-md shadow-[#06B6D4]/30'
                : 'bg-midnight-bg text-slate-300 hover:bg-midnight-hover border border-midnight-border'
            }`}
          >
            {t('reports.yesterdayBtn', { date: formatDateDisplay(getYesterdayKey()) })}
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2 pl-2 border-l border-midnight-border">
            <span className="text-xs font-semibold text-slate-400">{t('reports.pickDate')}</span>
            <input
              type="date"
              value={customReportDate}
              onChange={(e) => {
                setCustomReportDate(e.target.value);
                setReportDateMode('custom');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition focus:outline-none ${
                reportDateMode === 'custom'
                  ? 'border-brand-purple bg-brand-purple/15 text-white ring-1 ring-brand-purple'
                  : 'border-midnight-border bg-midnight-bg text-slate-300 hover:border-brand-purple/40'
              }`}
            />
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {t('reports.reportingFor', { date: formatDateDisplay(selectedDateKey) })}
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
              className={`bg-midnight-card rounded-2xl p-5 shadow-xl border border-midnight-border flex flex-col justify-between transition-all duration-200 hover:border-brand-purple/40 ${
                isHero
                  ? 'sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-midnight-card via-midnight-card to-brand-purple/15 border-brand-purple/40'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {metric.title}
                  </span>
                  <div
                    className={`mt-2 font-black tracking-tight ${
                      isHero
                        ? 'text-2xl sm:text-3xl text-gaming-green'
                        : 'text-xl sm:text-2xl text-white'
                    }`}
                  >
                    {metric.value}
                  </div>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${metric.bgColor} ${metric.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-midnight-border text-[11px] text-slate-400">
                {metric.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimal Visual Comparison & Financial Breakdown */}
      <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-purpleLight" />
          {t('reports.financialBreakdown', { date: formatDateDisplay(selectedDateKey) })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-midnight-bg border border-midnight-border">
            <span className="text-xs font-bold text-brand-purpleLight uppercase block mb-1">
              {t('reports.gamingOperations')}
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalGamingIncome, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('reports.consoleMarginHint', { hours: totalGamingHoursDecimal })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-midnight-bg border border-midnight-border">
            <span className="text-xs font-bold text-amber-400 uppercase block mb-1">
              {t('reports.productProfitMargin')}
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalProductRevenue - summary.totalProductCosts, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('reports.productMarginFormula', {
                rev: formatCurrency(summary.totalProductRevenue, currency),
                cost: formatCurrency(summary.totalProductCosts, currency),
              })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gaming-greenBg border border-gaming-green/30">
            <span className="text-xs font-bold text-gaming-green uppercase block mb-1">
              {t('reports.netEarnings')}
            </span>
            <div className="text-2xl font-black text-gaming-green">
              {formatCurrency(summary.totalProfit, currency)}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {t('reports.takeHomeHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions on Selected Date */}
      <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border">
        <div className="flex items-center justify-between pb-4 border-b border-midnight-border mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-purpleLight" />
            {t('reports.transactionsOnDate', {
              date: formatDateDisplay(selectedDateKey),
              count: dayTransactions.length,
            })}
          </h3>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            {t('reports.noTransactionsOnDate', { date: formatDateDisplay(selectedDateKey) })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight-bg text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-midnight-border">
                <tr>
                  <th className="py-2.5 px-3">{t('history.dateTimeCol')}</th>
                  <th className="py-2.5 px-3">{t('history.roomCol')} & {t('history.stationCol')}</th>
                  <th className="py-2.5 px-3">{t('reports.totalGamingHours')}</th>
                  <th className="py-2.5 px-3 text-right">{t('reports.totalGamingIncome')}</th>
                  <th className="py-2.5 px-3">{t('history.productsSoldCol')}</th>
                  <th className="py-2.5 px-3 text-right">{t('reports.totalProductRevenue')}</th>
                  <th className="py-2.5 px-3 text-right">{t('reports.totalProductCosts')}</th>
                  <th className="py-2.5 px-3 text-right">{t('history.totalProfitCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-border text-slate-300">
                {dayTransactions.map((tx) => {
                  const localizedRoom =
                    tx.roomId != null
                      ? t('rooms.roomN', { n: tx.roomId })
                      : tx.roomName || 'Store';
                  const localizedStation =
                    tx.stationId && tx.stationId !== '-'
                      ? `${t('common.stationPrefix')} ${tx.stationId}`
                      : '';

                  return (
                    <tr key={tx.id} className="hover:bg-midnight-bg/60 transition">
                      <td className="py-2.5 px-3 font-medium text-white">{tx.timeStr}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {localizedRoom} {localizedStation ? `— ${localizedStation}` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {tx.durationMs > 0 ? formatDurationHuman(tx.durationMs) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {formatCurrency(tx.gamingPayment, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {tx.products?.length > 0
                          ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-brand-lavender">
                        {formatCurrency(tx.productRevenue, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {formatCurrency(tx.productCost, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-gaming-green">
                        {formatCurrency(tx.totalProfit, currency)}
                      </td>
                    </tr>
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
