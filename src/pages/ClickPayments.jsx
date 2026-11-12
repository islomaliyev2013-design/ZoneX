import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Phone,
  Calendar,
  CreditCard,
  Receipt,
  Tv,
  ShoppingBag,
  TrendingUp,
  X,
  ArrowUpRight,
  Filter,
  Percent,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatTimeDisplay, toDateKey, getTodayKey, getYesterdayKey } from '../utils/formatters';

export default function ClickPayments() {
  const {
    clickPayments = [],
    transactions = [],
    settings = {},
    addClickPayment,
    updateClickPayment,
    deleteClickPayment,
    todayClickTotal = 0,
    totalClickAmount = 0,
    clickPaymentsCount = 0,
  } = useApp();

  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'this_month'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Calculations for Click Share vs Total Transactions Revenue
  const totalRevenueAll = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (Number(tx.totalPaid) || 0), 0);
  }, [transactions]);

  const clickSharePercent = useMemo(() => {
    if (!totalRevenueAll || totalRevenueAll <= 0) return 0;
    return Math.min(100, Math.round((totalClickAmount / totalRevenueAll) * 100));
  }, [totalClickAmount, totalRevenueAll]);

  const averageTicket = useMemo(() => {
    if (!clickPaymentsCount || clickPaymentsCount <= 0) return 0;
    return Math.round(totalClickAmount / clickPaymentsCount);
  }, [totalClickAmount, clickPaymentsCount]);

  // Current month prefix (YYYY-MM)
  const currentMonthPrefix = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    return clickPayments.filter((item) => {
      // Date filter
      if (dateFilter === 'today' && item.dateStr !== today) return false;
      if (dateFilter === 'yesterday' && item.dateStr !== yesterday) return false;
      if (dateFilter === 'this_month' && (!item.dateStr || !item.dateStr.startsWith(currentMonthPrefix))) return false;

      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = item.customerName?.toLowerCase().includes(query);
        const matchesPhone = item.phone?.toLowerCase().includes(query);
        const matchesRoom = item.roomStation?.toLowerCase().includes(query);
        const matchesRef = item.transactionRef?.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesRoom || matchesRef || matchesNotes;
      }
      return true;
    });
  }, [clickPayments, dateFilter, searchTerm, currentMonthPrefix]);

  const handleOpenAddModal = () => {
    setEditingPayment(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (payment) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = (id) => {
    if (window.confirm(t('click.confirmDelete'))) {
      deleteClickPayment(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Click Branding & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#00A5EC]/10 border border-[#00A5EC]/30 flex items-center justify-center text-[#00A5EC] shadow-xs flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#292524] tracking-tight">
                {t('click.title')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00A5EC] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                CLICK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              {t('click.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A5EC] hover:bg-[#0284C7] text-white font-bold text-sm shadow-sm transition active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('click.addPayment')}</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Today's Click Revenue */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-sky-50/80 border-2 border-sky-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#0284C7] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.todayClick')}
            </span>
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#0284C7] font-mono block">
              {formatCurrency(todayClickTotal, currency)}
            </span>
            <span className="text-[11px] font-semibold text-sky-700 mt-1 block">
              {clickPayments.filter((p) => p.dateStr === getTodayKey()).length} {t('click.itemsCount')}
            </span>
          </div>
        </div>

        {/* Total Click Revenue */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.totalClick')}
            </span>
            <CreditCard className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-[#292524] font-mono block">
              {formatCurrency(totalClickAmount, currency)}
            </span>
            <span className="text-[11px] text-[#78716C] mt-1 block">
              {t('click.filterAll')}
            </span>
          </div>
        </div>

        {/* Click Payments Count */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.paymentsCount')}
            </span>
            <Receipt className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#292524] font-mono block">
              {clickPaymentsCount}
            </span>
            <span className="text-[11px] text-[#78716C] mt-1 block">
              {t('click.itemsCount')}
            </span>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.averageTicket')}
            </span>
            <TrendingUp className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-[#292524] font-mono block">
              {formatCurrency(averageTicket, currency)}
            </span>
            <span className="text-[11px] text-[#78716C] mt-1 block">
              {currency} / {t('click.customerName').toLowerCase()}
            </span>
          </div>
        </div>

        {/* Click Share (%) */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.clickShare')}
            </span>
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#16A34A] font-mono block">
              {clickSharePercent}%
            </span>
            <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">
              Click • {100 - clickSharePercent}% Naqd
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search and Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7E5E4] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('click.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-[#292524] placeholder-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#00A5EC] focus:bg-white transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#292524] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl self-start sm:self-auto">
          {[
            { id: 'all', label: t('click.filterAll') },
            { id: 'today', label: t('click.filterToday') },
            { id: 'yesterday', label: t('click.filterYesterday') },
            { id: 'this_month', label: t('click.filterThisMonth') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                dateFilter === tab.id
                  ? 'bg-white text-[#292524] shadow-xs'
                  : 'text-[#78716C] hover:text-[#292524]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Click Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-3 text-[#00A5EC]">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#292524]">{t('click.emptyTitle')}</h3>
          <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">{t('click.emptyDesc')}</p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A5EC] text-white text-xs font-bold hover:bg-[#0284C7] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('click.addPayment')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const userInitial = (payment.customerName?.[0] || 'C').toUpperCase();

            // Purpose label
            let purposeText = payment.purposeLabel || '';
            if (!purposeText) {
              if (payment.purpose === 'session') purposeText = t('click.purposeSession');
              else if (payment.purpose === 'products') purposeText = t('click.purposeProducts');
              else if (payment.purpose === 'debt') purposeText = t('click.purposeDebt');
              else purposeText = t('click.purposeOther');
            }

            return (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border border-[#E7E5E4] hover:border-sky-300 transition-all shadow-xs p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Customer Info & Meta */}
                <div className="flex items-start gap-3.5 min-w-[260px]">
                  <div className="w-11 h-11 rounded-xl bg-[#00A5EC]/15 border border-[#00A5EC]/30 text-[#00A5EC] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                    {userInitial}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-[#292524] leading-tight">
                        {payment.customerName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#00A5EC]/10 border border-[#00A5EC]/20 text-[10px] font-black text-[#00A5EC] uppercase">
                        CLICK
                      </span>
                      {payment.transactionRef && (
                        <span className="px-2 py-0.5 rounded-md bg-[#F5F5F4] border border-[#E7E5E4] text-[10px] font-mono font-bold text-[#78716C]">
                          {payment.transactionRef}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#78716C] flex-wrap">
                      {payment.phone && (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#00A5EC]" />
                          <span>{payment.phone}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>
                          {payment.dateStr} {payment.timeStr}
                        </span>
                      </span>
                    </div>

                    {payment.notes && (
                      <p className="text-xs text-[#57534E] italic bg-[#F5F5F4] px-2.5 py-1 rounded-md border border-[#E7E5E4] inline-block">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center: Purpose & Room info */}
                <div className="lg:px-6 lg:border-x lg:border-[#E7E5E4] min-w-[240px] space-y-1">
                  <div className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                    {t('click.purpose')}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#292524] flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#00A5EC]" />
                    <span>{purposeText}</span>
                  </div>
                  {payment.roomStation && (
                    <div className="text-[11px] text-[#78716C] flex items-center gap-1 font-medium">
                      <span>{payment.roomStation}</span>
                    </div>
                  )}
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-4 min-w-[220px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#78716C] block">
                      {t('click.amount')}
                    </span>
                    <span className="text-lg sm:text-xl font-black font-mono text-[#00A5EC] block">
                      +{formatCurrency(payment.amount || 0, currency)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('click.statusCompleted')}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(payment)}
                      className="p-2 rounded-xl bg-[#F5F5F4] hover:bg-stone-200 text-[#44403C] border border-[#E7E5E4] transition cursor-pointer"
                      title={t('click.editPayment')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(payment.id)}
                      className="p-2 rounded-xl bg-white hover:bg-red-50 text-[#78716C] hover:text-[#DC2626] border border-[#E7E5E4] hover:border-red-200 transition cursor-pointer"
                      title={t('click.deletePayment')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add / Edit Click Payment Modal */}
      {isModalOpen && (
        <ClickPaymentModal
          isOpen={isModalOpen}
          initialData={editingPayment}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            if (editingPayment) {
              updateClickPayment(editingPayment.id, data);
            } else {
              addClickPayment(data);
            }
            setIsModalOpen(false);
          }}
          currency={currency}
          t={t}
        />
      )}
    </div>
  );
}

/**
 * Add / Edit Click Payment Modal
 * Mounted to document.body via createPortal with z-[100]
 */
function ClickPaymentModal({ isOpen, initialData, onClose, onSave, currency, t }) {
  const isEditing = Boolean(initialData);

  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [roomStation, setRoomStation] = useState(initialData?.roomStation || '');
  const [amount, setAmount] = useState(initialData?.amount != null ? String(initialData.amount) : '');
  const [purpose, setPurpose] = useState(initialData?.purpose || 'session');
  const [transactionRef, setTransactionRef] = useState(initialData?.transactionRef || '');
  const [dateStr, setDateStr] = useState(initialData?.dateStr || toDateKey(new Date()));
  const [timeStr, setTimeStr] = useState(initialData?.timeStr || formatTimeDisplay(new Date()));
  const [notes, setNotes] = useState(initialData?.notes || '');

  const parsedAmount = Number(amount) || 0;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (parsedAmount <= 0) {
      alert(t('click.amountPlaceholder'));
      return;
    }

    let purposeLabel = '';
    if (purpose === 'session') purposeLabel = t('click.purposeSession');
    else if (purpose === 'products') purposeLabel = t('click.purposeProducts');
    else if (purpose === 'debt') purposeLabel = t('click.purposeDebt');
    else purposeLabel = t('click.purposeOther');

    onSave({
      customerName: customerName.trim() || 'Mijoz',
      phone: phone.trim(),
      roomStation: roomStation.trim(),
      amount: parsedAmount,
      purpose,
      purposeLabel,
      transactionRef: transactionRef.trim(),
      dateStr,
      timeStr,
      notes: notes.trim(),
      status: 'completed',
    });
  };

  const modalNode = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[100] animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-lg w-full shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="shrink-0 p-5 border-b border-[#E7E5E4] flex items-center justify-between bg-sky-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A5EC]/15 border border-[#00A5EC]/30 flex items-center justify-center text-[#00A5EC]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#292524]">
                {isEditing ? t('click.editPayment') : t('click.addPayment')}
              </h3>
              <p className="text-xs text-[#78716C]">
                {isEditing ? initialData.customerName : t('click.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#292524] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('click.customerName')}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('click.customerNamePlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#00A5EC] font-bold text-[#292524]"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('click.customerPhone')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('click.customerPhonePlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#00A5EC] text-[#292524]"
              />
            </div>
          </div>

          {/* Amount (To'lov summasi) */}
          <div className="p-3.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#292524] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#00A5EC]" />
                <span>{t('click.amount')} *</span>
              </label>
              <span className="text-xs font-black text-[#00A5EC] font-mono">
                {formatCurrency(parsedAmount, currency)}
              </span>
            </div>

            <input
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-base bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#00A5EC] font-mono font-black text-[#292524]"
            />

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[10000, 20000, 30000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-[11px] font-bold text-[#0284C7] border border-[#E7E5E4] hover:border-sky-300 transition cursor-pointer"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose / Category */}
          <div>
            <label className="text-xs font-bold text-[#44403C] block mb-1.5">
              {t('click.purpose')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'session', label: t('click.purposeSession'), icon: Tv },
                { id: 'products', label: t('click.purposeProducts'), icon: ShoppingBag },
                { id: 'debt', label: t('click.purposeDebt'), icon: Receipt },
                { id: 'other', label: t('click.purposeOther'), icon: ArrowUpRight },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPurpose(item.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                      purpose === item.id
                        ? 'bg-[#00A5EC]/10 border-[#00A5EC] text-[#00A5EC] shadow-xs'
                        : 'bg-white border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room / Station & Receipt / Check ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('click.roomStation')}
              </label>
              <input
                type="text"
                value={roomStation}
                onChange={(e) => setRoomStation(e.target.value)}
                placeholder={t('click.roomStationPlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#00A5EC] text-[#292524]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('click.transactionRef')}
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder={t('click.transactionRefPlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#00A5EC] font-mono text-[#292524]"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('click.dateTime')}
              </label>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#E7E5E4] font-mono text-[#292524]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1 opacity-0">
                time
              </label>
              <input
                type="text"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#E7E5E4] font-mono text-[#292524]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-[#44403C] block mb-1">
              {t('click.notes')}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('click.notesPlaceholder')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#00A5EC] text-[#292524]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 bg-stone-50 border-t border-[#E7E5E4] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E7E5E4] text-[#78716C] hover:bg-white hover:text-[#292524] font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            {t('click.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-2 py-2.5 px-6 rounded-xl bg-[#00A5EC] hover:bg-[#0284C7] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('click.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}

