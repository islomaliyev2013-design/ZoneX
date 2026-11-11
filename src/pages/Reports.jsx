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
      color: 'text-[#0D9488]',
      bgColor: 'bg-[#F0FDFA] border-[#CCFBF1]',
    },
    {
      id: 'product_revenue',
      title: t('reports.totalProductRevenue'),
      value: formatCurrency(summary.totalProductRevenue, currency),
      subtext: t('reports.grossSalesSubtext'),
      icon: ShoppingBag,
      color: 'text-[#0D9488]',
      bgColor: 'bg-[#F0FDFA] border-[#CCFBF1]',
    },
    {
      id: 'product_costs',
      title: t('reports.totalProductCosts'),
      value: formatCurrency(summary.totalProductCosts, currency),
      subtext: t('reports.costOfGoodsSubtext'),
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    {
      id: 'total_gaming_hours',
      title: t('reports.totalGamingHours'),
      value: `${totalGamingHoursDecimal} hrs`,
      subtext: t('reports.acrossStationsSubtext', { time: totalGamingHoursFormatted }),
      icon: Clock,
      color: 'text-[#0D9488]',
      bgColor: 'bg-[#F0FDFA] border-[#CCFBF1]',
    },
    {
      id: 'total_profit',
      title: t('reports.totalProfit'),
      value: formatCurrency(summary.totalProfit, currency),
      subtext: t('reports.gamingPlusProductSubtext'),
      icon: TrendingUp,
      color: 'text-[#16A34A]',
      bgColor: 'bg-[#F0FDF4] border-green-200',
      isHero: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight">
            {t('reports.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            {t('reports.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F5F4] text-[#292524] border border-[#E7E5E4] text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#0D9488]" />
          {t('reports.printPdf')}
        </button>
      </div>

      {/* Date Selection Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E7E5E4] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-wide flex items-center gap-1.5 mr-2">
            <Calendar className="w-4 h-4 text-[#0D9488]" /> {t('reports.selectReportPeriod')}
          </span>

          <button
            type="button"
            onClick={() => setReportDateMode('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportDateMode === 'today'
                ? 'bg-[#0D9488] text-white font-bold shadow-xs'
                : 'bg-[#F5F5F4] text-[#78716C] hover:text-[#292524] border border-[#E7E5E4]'
            }`}
          >
            {t('reports.todayBtn', { date: formatDateDisplay(getTodayKey()) })}
          </button>

          <button
            type="button"
            onClick={() => setReportDateMode('yesterday')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              reportDateMode === 'yesterday'
                ? 'bg-[#0D9488] text-white font-bold shadow-xs'
                : 'bg-[#F5F5F4] text-[#78716C] hover:text-[#292524] border border-[#E7E5E4]'
            }`}
          >
            {t('reports.yesterdayBtn', { date: formatDateDisplay(getYesterdayKey()) })}
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E7E5E4]">
            <span className="text-xs font-semibold text-[#78716C]">{t('reports.pickDate')}</span>
            <input
              type="date"
              value={customReportDate}
              onChange={(e) => {
                setCustomReportDate(e.target.value);
                setReportDateMode('custom');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition focus:outline-none cursor-pointer ${
                reportDateMode === 'custom'
                  ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0D9488] ring-1 ring-[#0D9488]'
                  : 'border-[#E7E5E4] bg-[#F5F5F4] text-[#292524] hover:border-[#0D9488]/40'
              }`}
            />
          </div>
        </div>

        <div className="text-xs text-[#78716C] font-semibold">
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
                  ? 'sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-white via-white to-[#F0FDFA] border-[#99F6E4]'
                  : 'bg-white border-[#E7E5E4] hover:border-[#0D9488]/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">
                    {metric.title}
                  </span>
                  <div
                    className={`mt-2 font-black tracking-tight ${
                      isHero
                        ? 'text-2xl sm:text-3xl text-[#16A34A]'
                        : 'text-xl sm:text-2xl text-[#292524]'
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

              <div className="mt-4 pt-3 border-t border-[#E7E5E4] text-[11px] text-[#78716C]">
                {metric.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimal Visual Comparison & Financial Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4]">
        <h3 className="text-base font-bold text-[#292524] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#0D9488]" />
          {t('reports.financialBreakdown', { date: formatDateDisplay(selectedDateKey) })}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4]">
            <span className="text-xs font-bold text-[#0D9488] uppercase block mb-1">
              {t('reports.gamingOperations')}
            </span>
            <div className="text-2xl font-black text-[#292524]">
              {formatCurrency(summary.totalGamingIncome, currency)}
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              {t('reports.consoleMarginHint', { hours: totalGamingHoursDecimal })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4]">
            <span className="text-xs font-bold text-amber-600 uppercase block mb-1">
              {t('reports.productProfitMargin')}
            </span>
            <div className="text-2xl font-black text-[#292524]">
              {formatCurrency(summary.totalProductRevenue - summary.totalProductCosts, currency)}
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              {t('reports.productMarginFormula', {
                rev: formatCurrency(summary.totalProductRevenue, currency),
                cost: formatCurrency(summary.totalProductCosts, currency),
              })}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F0FDF4] border border-green-200">
            <span className="text-xs font-bold text-[#16A34A] uppercase block mb-1">
              {t('reports.netEarnings')}
            </span>
            <div className="text-2xl font-black text-[#16A34A]">
              {formatCurrency(summary.totalProfit, currency)}
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              {t('reports.takeHomeHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions on Selected Date */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4] mb-4">
          <h3 className="text-base font-bold text-[#292524] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0D9488]" />
            {t('reports.transactionsOnDate', {
              date: formatDateDisplay(selectedDateKey),
              count: dayTransactions.length,
            })}
          </h3>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="text-center py-10 text-[#78716C] text-xs">
            {t('reports.noTransactionsOnDate', { date: formatDateDisplay(selectedDateKey) })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F4] text-[#78716C] uppercase tracking-wider text-[10px] font-bold border-b border-[#E7E5E4]">
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
              <tbody className="divide-y divide-[#E7E5E4] text-[#292524]">
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
                    <tr key={tx.id} className="hover:bg-[#F5F5F4]/60 transition">
                      <td className="py-2.5 px-3 font-semibold text-[#292524]">{tx.timeStr}</td>
                      <td className="py-2.5 px-3 font-bold text-[#292524]">
                        {localizedRoom} {localizedStation ? `— ${localizedStation}` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-[#78716C]">
                        {tx.durationMs > 0 ? formatDurationHuman(tx.durationMs) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#292524]">
                        {formatCurrency(tx.gamingPayment, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-[#292524]">
                        {tx.products?.length > 0
                          ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#0D9488]">
                        {formatCurrency(tx.productRevenue, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#78716C]">
                        {formatCurrency(tx.productCost, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-[#16A34A]">
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
