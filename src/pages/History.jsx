import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Calendar,
  Search,
  Receipt,
  ChevronDown,
  ChevronUp,
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

export default function History() {
  const { transactions, settings } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  const [dateFilterMode, setDateFilterMode] = useState('all');
  const [customDate, setCustomDate] = useState(getTodayKey());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTxId, setExpandedTxId] = useState(null);

  const filteredTransactions = transactions.filter((tx) => {
    if (dateFilterMode === 'today') {
      if (tx.dateStr !== getTodayKey()) return false;
    } else if (dateFilterMode === 'yesterday') {
      if (tx.dateStr !== getYesterdayKey()) return false;
    } else if (dateFilterMode === 'custom') {
      if (tx.dateStr !== customDate) return false;
    }

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
          {t('history.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
          {t('history.subtitle')}
        </p>
      </div>

      {/* Filter and Date Bar Card */}
      <div className="bg-[#1D1B2E] rounded-2xl p-5 shadow-sm border border-[rgba(167,139,250,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wide flex items-center gap-1.5 mr-1">
            <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" /> {t('history.dateLabel')}
          </span>

          <button
            type="button"
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dateFilterMode === 'all'
                ? 'bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                : 'bg-[#101014] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)]'
            }`}
          >
            {t('history.allDates', { count: transactions.length })}
          </button>

          <button
            type="button"
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dateFilterMode === 'today'
                ? 'bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                : 'bg-[#101014] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)]'
            }`}
          >
            {t('history.today')}
          </button>

          <button
            type="button"
            onClick={() => setDateFilterMode('yesterday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dateFilterMode === 'yesterday'
                ? 'bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                : 'bg-[#101014] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)]'
            }`}
          >
            {t('history.yesterday')}
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
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition focus:outline-none cursor-pointer ${
                dateFilterMode === 'custom'
                  ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#A78BFA] ring-1 ring-[#7C3AED]'
                  : 'border-[rgba(167,139,250,0.2)] bg-[#101014] text-white hover:border-[#7C3AED]/40'
              }`}
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('history.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[rgba(167,139,250,0.2)] text-xs font-medium text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] bg-[#101014] transition"
          />
        </div>

      </div>

      {/* Summary of Filtered Results */}
      {filteredTransactions.length > 0 && (
        <div className="bg-[#1D1B2E] text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-[rgba(167,139,250,0.15)] shadow-sm">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#A78BFA]" />
            <span className="text-sm font-bold text-white">
              {t('history.showingRecords', { count: filteredTransactions.length })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold">
                {t('history.gamingIncome')}
              </span>
              <span className="font-extrabold text-white">
                {formatCurrency(summary.totalGamingIncome, currency)}
              </span>
            </div>
            <div>
              <span className="text-[#A78BFA] block text-[10px] uppercase font-bold">
                {t('history.productSales')}
              </span>
              <span className="font-extrabold text-[#A78BFA]">
                {formatCurrency(summary.totalProductRevenue, currency)}
              </span>
            </div>
            <div>
              <span className="text-[#A1A1AA] block text-[10px] uppercase font-bold">
                {t('history.productCosts')}
              </span>
              <span className="font-extrabold text-[#A1A1AA]">
                {formatCurrency(summary.totalProductCosts, currency)}
              </span>
            </div>
            <div>
              <span className="text-emerald-400 block text-[10px] uppercase font-bold">
                {t('history.totalNetProfit')}
              </span>
              <span className="font-black text-emerald-400 text-base">
                {formatCurrency(summary.totalProfit, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table Card */}
      <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)] overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#101014] border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {t('history.noTransactionsTitle')}
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {transactions.length === 0
                ? t('history.noTransactionsFresh')
                : t('history.noTransactionsFilter')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101014]/60 text-[#A1A1AA] uppercase tracking-wider text-[11px] font-bold border-y border-[rgba(167,139,250,0.15)]">
                <tr>
                  <th className="py-3 px-4">{t('history.dateTimeCol')}</th>
                  <th className="py-3 px-3">{t('history.roomCol')}</th>
                  <th className="py-3 px-3">{t('history.stationCol')}</th>
                  <th className="py-3 px-3">{t('history.durationCol')}</th>
                  <th className="py-3 px-3 text-right">{t('history.gamingPayCol')}</th>
                  <th className="py-3 px-4">{t('history.productsSoldCol')}</th>
                  <th className="py-3 px-3 text-right">{t('history.productRevCol')}</th>
                  <th className="py-3 px-3 text-right">{t('history.productCostCol')}</th>
                  <th className="py-3 px-4 text-right">{t('history.totalProfitCol')}</th>
                  <th className="py-3 px-3 text-center">{t('history.receiptCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(167,139,250,0.1)] text-white">
                {filteredTransactions.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  const hasProducts = tx.products && tx.products.length > 0;
                  const productsSummary = hasProducts
                    ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')
                    : '—';

                  const rawRoom = tx.roomName || (tx.roomId != null ? `${tx.roomId}-PlayStation` : 'Store');
                  const localizedRoom = rawRoom.replace(/^(\d+)-xona$/i, '$1-PlayStation');
                  const rawStation = tx.stationName || (tx.stationId && tx.stationId !== '-' ? `${tx.stationId}-xona` : '—');
                  const localizedStation = rawStation.replace(/^Konsol\s*(\d+)$/i, '$1-xona');

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-[#25233B]/40 transition">
                        {/* Date & Time */}
                        <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{formatDateDisplay(tx.createdAt || tx.dateStr)}</span>
                            {tx.paymentMethod === 'click' ? (
                              <span className="px-1.5 py-0.2 rounded bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 font-black text-[9px] uppercase">
                                Click
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-[#101014] text-[#A1A1AA] border border-[rgba(167,139,250,0.15)] font-bold text-[9px] uppercase">
                                Naqd
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#A1A1AA] font-normal">{tx.timeStr}</div>
                        </td>

                        {/* Room */}
                        <td className="py-3 px-3 font-bold whitespace-nowrap text-white">
                          {localizedRoom}
                        </td>

                        {/* PlayStation Station */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {localizedStation !== '—' ? (
                            <span className="font-bold text-[#A78BFA] bg-[#7C3AED]/20 border border-[rgba(167,139,250,0.25)] px-2 py-0.5 rounded">
                              {localizedStation}
                            </span>
                          ) : (
                            <span className="text-[#A1A1AA]">—</span>
                          )}
                        </td>

                        {/* Gaming Duration */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {tx.durationMs && tx.durationMs > 0 ? (
                            <span className="font-medium text-white">
                              {formatDurationHuman(tx.durationMs)}
                            </span>
                          ) : (
                            <span className="text-[#A1A1AA]">—</span>
                          )}
                        </td>

                        {/* Gaming Payment */}
                        <td className="py-3 px-3 text-right font-bold text-white whitespace-nowrap">
                          {formatCurrency(tx.gamingPayment, currency)}
                        </td>

                        {/* Products Sold & Quantities */}
                        <td className="py-3 px-4 max-w-xs truncate" title={productsSummary}>
                          <span className={hasProducts ? 'font-medium text-white' : 'text-[#A1A1AA]'}>
                            {productsSummary}
                          </span>
                        </td>

                        {/* Product Revenue */}
                        <td className="py-3 px-3 text-right font-semibold text-[#A78BFA] whitespace-nowrap">
                          {formatCurrency(tx.productRevenue, currency)}
                        </td>

                        {/* Product Costs */}
                        <td className="py-3 px-3 text-right text-[#A1A1AA] whitespace-nowrap">
                          {formatCurrency(tx.productCost, currency)}
                        </td>

                        {/* Total Profit */}
                        <td className="py-3 px-4 text-right font-black text-emerald-400 whitespace-nowrap">
                          {formatCurrency(tx.totalProfit, currency)}
                        </td>

                        {/* Expand Receipt */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleExpand(tx.id)}
                            className="p-1 rounded text-[#A1A1AA] hover:text-white hover:bg-[#25233B] transition cursor-pointer"
                            title={t('history.receiptCol')}
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
                        <tr className="bg-[#101014]/60">
                          <td colSpan={10} className="p-4">
                            <div className="bg-[#101014] rounded-xl p-4 border border-[rgba(167,139,250,0.15)] space-y-3 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(167,139,250,0.15)] pb-2">
                                <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                                  <span>
                                    {t('history.receiptDetails', {
                                      id: tx.id.slice(-6),
                                      customer: tx.customerName || t('common.walkIn'),
                                    })}
                                  </span>
                                  {tx.durationMs > 0 && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] font-bold">
                                      O‘yin: {formatDurationHuman(tx.durationMs)} ({formatCurrency(tx.gamingPayment, currency)})
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white font-bold">
                                  {t('history.totalCollected', {
                                    amount: formatCurrency(
                                      tx.totalPaid || tx.gamingPayment + tx.productRevenue,
                                      currency
                                    ),
                                  })}
                                </div>
                              </div>

                              {/* Products itemized table */}
                              {hasProducts ? (
                                <div>
                                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA] mb-1.5">
                                    {t('history.itemizedProducts')}
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                    {tx.products.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2.5 rounded-lg bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] text-xs"
                                      >
                                        <div className="font-bold text-white">
                                          {item.quantity}x {item.name}
                                        </div>
                                        <div className="text-[#A1A1AA] text-[11px] mt-1 flex justify-between">
                                          <span>
                                            {t('history.buy', {
                                              price: formatCurrency(item.purchasePrice, currency),
                                            })}
                                          </span>
                                          <span>
                                            {t('history.sell', {
                                              price: formatCurrency(item.sellingPrice, currency),
                                            })}
                                          </span>
                                        </div>
                                        <div className="text-emerald-400 font-bold text-[11px] mt-0.5 text-right">
                                          {t('history.profitItem', {
                                            profit: formatCurrency(
                                              item.profit || item.totalRevenue - item.totalCost,
                                              currency
                                            ),
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-[#A1A1AA] italic">
                                  {t('history.noProductsInTx')}
                                </p>
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
