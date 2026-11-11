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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight">
          {t('history.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#78716C] mt-1">
          {t('history.subtitle')}
        </p>
      </div>

      {/* Filter and Date Bar Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E7E5E4] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-wide flex items-center gap-1.5 mr-1">
            <Calendar className="w-3.5 h-3.5 text-[#0D9488]" /> {t('history.dateLabel')}
          </span>

          <button
            type="button"
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dateFilterMode === 'all'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-[#F5F5F4] text-[#78716C] hover:text-[#292524] border border-[#E7E5E4]'
            }`}
          >
            {t('history.allDates', { count: transactions.length })}
          </button>

          <button
            type="button"
            onClick={() => setDateFilterMode('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dateFilterMode === 'today'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-[#F5F5F4] text-[#78716C] hover:text-[#292524] border border-[#E7E5E4]'
            }`}
          >
            {t('history.today')}
          </button>

          <button
            type="button"
            onClick={() => setDateFilterMode('yesterday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              dateFilterMode === 'yesterday'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-[#F5F5F4] text-[#78716C] hover:text-[#292524] border border-[#E7E5E4]'
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
                  ? 'border-[#0D9488] bg-[#F0FDFA] text-[#0D9488] ring-1 ring-[#0D9488]'
                  : 'border-[#E7E5E4] bg-[#F5F5F4] text-[#292524] hover:border-[#0D9488]/40'
              }`}
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('history.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E7E5E4] text-xs font-medium text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] bg-[#F5F5F4] transition"
          />
        </div>

      </div>

      {/* Summary of Filtered Results */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white text-[#292524] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0D9488]" />
            <span className="text-sm font-bold text-[#292524]">
              {t('history.showingRecords', { count: filteredTransactions.length })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-[#78716C] block text-[10px] uppercase font-bold">
                {t('history.gamingIncome')}
              </span>
              <span className="font-extrabold text-[#292524]">
                {formatCurrency(summary.totalGamingIncome, currency)}
              </span>
            </div>
            <div>
              <span className="text-[#0D9488] block text-[10px] uppercase font-bold">
                {t('history.productSales')}
              </span>
              <span className="font-extrabold text-[#0D9488]">
                {formatCurrency(summary.totalProductRevenue, currency)}
              </span>
            </div>
            <div>
              <span className="text-[#78716C] block text-[10px] uppercase font-bold">
                {t('history.productCosts')}
              </span>
              <span className="font-extrabold text-[#78716C]">
                {formatCurrency(summary.totalProductCosts, currency)}
              </span>
            </div>
            <div>
              <span className="text-[#16A34A] block text-[10px] uppercase font-bold">
                {t('history.totalNetProfit')}
              </span>
              <span className="font-black text-[#16A34A] text-base">
                {formatCurrency(summary.totalProfit, currency)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4] overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#A8A29E] flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#292524] mb-1">
              {t('history.noTransactionsTitle')}
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              {transactions.length === 0
                ? t('history.noTransactionsFresh')
                : t('history.noTransactionsFilter')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F4] text-[#78716C] uppercase tracking-wider text-[11px] font-bold border-y border-[#E7E5E4]">
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
              <tbody className="divide-y divide-[#E7E5E4] text-[#292524]">
                {filteredTransactions.map((tx) => {
                  const isExpanded = expandedTxId === tx.id;
                  const hasProducts = tx.products && tx.products.length > 0;
                  const productsSummary = hasProducts
                    ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')
                    : '—';

                  const localizedRoom =
                    tx.roomId != null ? t('rooms.roomN', { n: tx.roomId }) : tx.roomName || 'Store';
                  const localizedStation =
                    tx.stationId && tx.stationId !== '-'
                      ? `${t('common.stationPrefix')} ${tx.stationId}`
                      : '—';

                  return (
                    <React.Fragment key={tx.id}>
                      <tr className="hover:bg-[#F5F5F4]/60 transition">
                        {/* Date & Time */}
                        <td className="py-3 px-4 font-semibold text-[#292524] whitespace-nowrap">
                          <div>{formatDateDisplay(tx.createdAt || tx.dateStr)}</div>
                          <div className="text-[10px] text-[#78716C] font-normal">{tx.timeStr}</div>
                        </td>

                        {/* Room */}
                        <td className="py-3 px-3 font-bold whitespace-nowrap text-[#292524]">
                          {localizedRoom}
                        </td>

                        {/* PlayStation Station */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {localizedStation !== '—' ? (
                            <span className="font-bold text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] px-2 py-0.5 rounded">
                              {localizedStation}
                            </span>
                          ) : (
                            <span className="text-[#A8A29E]">—</span>
                          )}
                        </td>

                        {/* Gaming Duration */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {tx.durationMs && tx.durationMs > 0 ? (
                            <span className="font-medium text-[#292524]">
                              {formatDurationHuman(tx.durationMs)}
                            </span>
                          ) : (
                            <span className="text-[#A8A29E]">—</span>
                          )}
                        </td>

                        {/* Gaming Payment */}
                        <td className="py-3 px-3 text-right font-bold text-[#292524] whitespace-nowrap">
                          {formatCurrency(tx.gamingPayment, currency)}
                        </td>

                        {/* Products Sold & Quantities */}
                        <td className="py-3 px-4 max-w-xs truncate" title={productsSummary}>
                          <span className={hasProducts ? 'font-medium text-[#292524]' : 'text-[#A8A29E]'}>
                            {productsSummary}
                          </span>
                        </td>

                        {/* Product Revenue */}
                        <td className="py-3 px-3 text-right font-semibold text-[#0D9488] whitespace-nowrap">
                          {formatCurrency(tx.productRevenue, currency)}
                        </td>

                        {/* Product Costs */}
                        <td className="py-3 px-3 text-right text-[#78716C] whitespace-nowrap">
                          {formatCurrency(tx.productCost, currency)}
                        </td>

                        {/* Total Profit */}
                        <td className="py-3 px-4 text-right font-black text-[#16A34A] whitespace-nowrap">
                          {formatCurrency(tx.totalProfit, currency)}
                        </td>

                        {/* Expand Receipt */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleExpand(tx.id)}
                            className="p-1 rounded text-[#78716C] hover:text-[#0D9488] hover:bg-[#F5F5F4] transition cursor-pointer"
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
                        <tr className="bg-[#F5F5F4]/60">
                          <td colSpan={10} className="p-4">
                            <div className="bg-white rounded-xl p-4 border border-[#E7E5E4] space-y-3 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E5E4] pb-2">
                                <div className="text-xs font-bold text-[#292524] flex items-center gap-2 flex-wrap">
                                  <span>
                                    {t('history.receiptDetails', {
                                      id: tx.id.slice(-6),
                                      customer: tx.customerName || t('common.walkIn'),
                                    })}
                                  </span>
                                  {tx.durationMs > 0 && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] font-bold">
                                      O‘yin: {formatDurationHuman(tx.durationMs)} ({formatCurrency(tx.gamingPayment, currency)})
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-[#292524] font-bold">
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
                                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] mb-1.5">
                                    {t('history.itemizedProducts')}
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                    {tx.products.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2.5 rounded-lg bg-[#F5F5F4] border border-[#E7E5E4] text-xs"
                                      >
                                        <div className="font-bold text-[#292524]">
                                          {item.quantity}x {item.name}
                                        </div>
                                        <div className="text-[#78716C] text-[11px] mt-1 flex justify-between">
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
                                        <div className="text-[#16A34A] font-bold text-[11px] mt-0.5 text-right">
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
                                <p className="text-xs text-[#78716C] italic">
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
