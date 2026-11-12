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
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#7C3AED]/20 border-[rgba(167,139,250,0.25)]',
    },
    {
      id: 'product_revenue',
      title: t('reports.totalProductRevenue'),
      value: formatCurrency(summary.totalProductRevenue, currency),
      subtext: t('reports.grossSalesSubtext'),
      icon: ShoppingBag,
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#7C3AED]/20 border-[rgba(167,139,250,0.25)]',
    },
    {
      id: 'product_costs',
      title: t('reports.totalProductCosts'),
      value: formatCurrency(summary.totalProductCosts, currency),
      subtext: t('reports.costOfGoodsSubtext'),
      icon: DollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border-amber-500/30',
    },
    {
      id: 'total_gaming_hours',
      title: t('reports.totalGamingHours'),
      value: `${totalGamingHoursDecimal} hrs`,
      subtext: t('reports.acrossStationsSubtext', { time: totalGamingHoursFormatted }),
      icon: Clock,
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#7C3AED]/20 border-[rgba(167,139,250,0.25)]',
    },
    {
      id: 'total_profit',
      title: t('reports.totalProfit'),
      value: formatCurrency(summary.totalProfit, currency),
      subtext: t('reports.gamingPlusProductSubtext'),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border-emerald-500/30',
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
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            {t('reports.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D1B2E] hover:bg-[#25233B] text-white border border-[rgba(167,139,250,0.15)] text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#A78BFA]" />
          {t('reports.printPdf')}
        </button>
      </div>

      {/* Date Selection Bar */}
      <div className="bg-[#1D1B2E] rounded-2xl p-5 shadow-sm border border-[rgba(167,139,250,0.15)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wide flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-[#A78BFA]" /> {t('reports.selectReportPeriod')}
          </span>

          <button
            type="button"
            onClick={() => setReportDateMode('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportDateMode === 'today'
                ? 'bg-[#7C3AED] text-white font-bold shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                : 'bg-[#101014] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)]'
            }`}
          >
            {t('reports.todayBtn', { date: formatDateDisplay(getTodayKey()) })}
          </button>

          <button
            type="button"
            onClick={() => setReportDateMode('yesterday')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportDateMode === 'yesterday'
                ? 'bg-[#7C3AED] text-white font-bold shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                : 'bg-[#101014] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)]'
            }`}
          >
            {t('reports.yesterdayBtn', { date: formatDateDisplay(getYesterdayKey()) })}
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2 pl-2 border-l border-[rgba(167,139,250,0.15)]">
            <span className="text-xs font-semibold text-[#A1A1AA]">{t('reports.pickDate')}</span>
            <input
              type="date"
              value={customReportDate}
              onChange={(e) => {
                setCustomReportDate(e.target.value);
                setReportDateMode('custom');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition focus:outline-none cursor-pointer ${
                reportDateMode === 'custom'
                  ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#A78BFA] ring-1 ring-[#7C3AED]'
                  : 'border-[rgba(167,139,250,0.2)] bg-[#101014] text-white hover:border-[#7C3AED]/40'
              }`}
            />
          </div>
        </div>

        <div className="text-xs text-[#A1A1AA] font-semibold">
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
              className={`rounded-2xl p-5 shadow-sm border flex flex-col justify-between transition-all duration-200 ${
                isHero
                  ? 'sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#1D1B2E] via-[#1D1B2E] to-[#25233B] border-[rgba(167,139,250,0.3)] shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                  : 'bg-[#1D1B2E] border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                    {metric.title}
                  </span>
                  <div
                    className={`mt-2 font-black tracking-tight ${
                      isHero
                        ? 'text-2xl sm:text-3xl text-emerald-400'
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

              <div className="mt-4 pt-3 border-t border-[rgba(167,139,250,0.15)] text-[11px] text-[#A1A1AA]">
                {metric.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimal Visual Comparison & Financial Breakdown */}
      <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)]">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#A78BFA]" />
          {t('reports.financialBreakdown', { date: formatDateDisplay(selectedDateKey) })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#101014] border border-[rgba(167,139,250,0.15)]">
            <span className="text-xs font-bold text-[#A78BFA] uppercase block mb-1">
              {t('reports.gamingOperations')}
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalGamingIncome, currency)}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {t('reports.consoleMarginHint', { hours: totalGamingHoursDecimal })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101014] border border-[rgba(167,139,250,0.15)]">
            <span className="text-xs font-bold text-amber-400 uppercase block mb-1">
              {t('reports.productProfitMargin')}
            </span>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalProductRevenue - summary.totalProductCosts, currency)}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {t('reports.productMarginFormula', {
                rev: formatCurrency(summary.totalProductRevenue, currency),
                cost: formatCurrency(summary.totalProductCosts, currency),
              })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400 uppercase block mb-1">
              {t('reports.netEarnings')}
            </span>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrency(summary.totalProfit, currency)}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {t('reports.takeHomeHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions on Selected Date */}
      <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)]">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(167,139,250,0.15)] mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#A78BFA]" />
            {t('reports.transactionsOnDate', {
              date: formatDateDisplay(selectedDateKey),
              count: dayTransactions.length,
            })}
          </h3>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="text-center py-10 text-[#A1A1AA] text-xs">
            {t('reports.noTransactionsOnDate', { date: formatDateDisplay(selectedDateKey) })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101014]/60 text-[#A1A1AA] uppercase tracking-wider text-[10px] font-bold border-b border-[rgba(167,139,250,0.15)]">
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
              <tbody className="divide-y divide-[rgba(167,139,250,0.1)] text-white">
                {dayTransactions.map((tx) => {
                  const rawRoom = tx.roomName || (tx.roomId != null ? `${tx.roomId}-PlayStation` : 'Store');
                  const localizedRoom = rawRoom.replace(/^(\d+)-xona$/i, '$1-PlayStation');
                  const rawStation = tx.stationName || (tx.stationId && tx.stationId !== '-' ? `${tx.stationId}-xona` : '');
                  const localizedStation = rawStation.replace(/^Konsol\s*(\d+)$/i, '$1-xona');

                  return (
                    <tr key={tx.id} className="hover:bg-[#25233B]/40 transition">
                      <td className="py-2.5 px-3 font-semibold text-white">{tx.timeStr}</td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {localizedRoom} {localizedStation ? `— ${localizedStation}` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-[#A1A1AA]">
                        {tx.durationMs > 0 ? formatDurationHuman(tx.durationMs) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {formatCurrency(tx.gamingPayment, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-white">
                        {tx.products?.length > 0
                          ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#A78BFA]">
                        {formatCurrency(tx.productRevenue, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#A1A1AA]">
                        {formatCurrency(tx.productCost, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
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
