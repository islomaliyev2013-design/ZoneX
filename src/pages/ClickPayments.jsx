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
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatTimeDisplay, toDateKey, getTodayKey, getYesterdayKey } from '../utils/formatters';

export default function ClickPayments() {
  const {
    clickPayments = [],
    rooms = [],
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
    <div className="space-y-6 pb-12">
      {/* 1. Header with Click Branding & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#1D1B2E] p-5 sm:p-6 rounded-2xl border border-[rgba(167,139,250,0.15)] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 border border-[rgba(167,139,250,0.25)] flex items-center justify-center text-[#A78BFA] shadow-xs flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('click.title')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                CLICK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
              {t('click.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.35)] transition active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('click.addPayment')}</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Today's Click Revenue */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#1D1B2E] border-2 border-[rgba(167,139,250,0.3)] shadow-[0_0_15px_rgba(124,58,237,0.15)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A78BFA] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.todayClick')}
            </span>
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#A78BFA] font-mono block">
              {formatCurrency(todayClickTotal, currency)}
            </span>
            <span className="text-[11px] font-semibold text-[#A1A1AA] mt-1 block">
              {clickPayments.filter((p) => p.dateStr === getTodayKey()).length} {t('click.itemsCount')}
            </span>
          </div>
        </div>

        {/* Total Click Revenue */}
        <div className="p-4 rounded-2xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.totalClick')}
            </span>
            <CreditCard className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-white font-mono block">
              {formatCurrency(totalClickAmount, currency)}
            </span>
            <span className="text-[11px] text-[#A1A1AA] mt-1 block">
              {t('click.filterAll')}
            </span>
          </div>
        </div>

        {/* Click Payments Count */}
        <div className="p-4 rounded-2xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.paymentsCount')}
            </span>
            <Receipt className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono block">
              {clickPaymentsCount}
            </span>
            <span className="text-[11px] text-[#A1A1AA] mt-1 block">
              {t('click.itemsCount')}
            </span>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="p-4 rounded-2xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.averageTicket')}
            </span>
            <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-white font-mono block">
              {formatCurrency(averageTicket, currency)}
            </span>
            <span className="text-[11px] text-[#A1A1AA] mt-1 block">
              {currency} / {t('click.customerName').toLowerCase()}
            </span>
          </div>
        </div>

        {/* Click Share (%) */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#1D1B2E] border border-emerald-500/30 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('click.clickShare')}
            </span>
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">
              {clickSharePercent}%
            </span>
            <span className="text-[11px] text-emerald-300 mt-1 block font-semibold">
              Click • {100 - clickSharePercent}% Naqd
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search and Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1D1B2E] p-3.5 sm:p-4 rounded-2xl border border-[rgba(167,139,250,0.15)] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('click.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-white placeholder-[#A1A1AA]/60 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101014] border border-[rgba(167,139,250,0.15)] rounded-xl self-start sm:self-auto">
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
                  ? 'bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Click Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-[#1D1B2E] rounded-2xl border border-[rgba(167,139,250,0.15)] p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#101014] border border-[rgba(167,139,250,0.15)] flex items-center justify-center mx-auto mb-3 text-[#A78BFA]">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">{t('click.emptyTitle')}</h3>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">{t('click.emptyDesc')}</p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.35)]"
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
                className="bg-[#1D1B2E] rounded-2xl border border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)] transition-all shadow-xs p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Customer Info & Meta */}
                <div className="flex items-start gap-3.5 min-w-[260px]">
                  <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/20 border border-[rgba(167,139,250,0.25)] text-[#A78BFA] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                    {userInitial}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                        {payment.customerName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[10px] font-black text-[#A78BFA] uppercase">
                        CLICK
                      </span>
                      {payment.transactionRef && (
                        <span className="px-2 py-0.5 rounded-md bg-[#101014] border border-[rgba(167,139,250,0.2)] text-[10px] font-mono font-bold text-[#A78BFA]">
                          {payment.transactionRef}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#A1A1AA] flex-wrap">
                      {payment.phone && (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>{payment.phone}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#A1A1AA]" />
                        <span>
                          {payment.dateStr} {payment.timeStr}
                        </span>
                      </span>
                    </div>

                    {payment.notes && (
                      <p className="text-xs text-[#A1A1AA] italic bg-[#101014] px-2.5 py-1 rounded-md border border-[rgba(167,139,250,0.15)] inline-block">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center: Purpose & Room info */}
                <div className="lg:px-6 lg:border-x lg:border-[rgba(167,139,250,0.15)] min-w-[240px] space-y-1">
                  <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                    {t('click.purpose')}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span>{purposeText}</span>
                  </div>
                  {payment.roomStation && (
                    <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1 font-medium">
                      <span>{payment.roomStation}</span>
                    </div>
                  )}
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-4 min-w-[220px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#A1A1AA] block">
                      {t('click.amount')}
                    </span>
                    <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 block">
                      +{formatCurrency(payment.amount || 0, currency)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('click.statusCompleted')}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(payment)}
                      className="p-2 rounded-xl bg-[#101014] hover:bg-[#25233B] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)] transition cursor-pointer"
                      title={t('click.editPayment')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(payment.id)}
                      className="p-2 rounded-xl bg-[#101014] hover:bg-rose-500/20 text-[#A1A1AA] hover:text-rose-400 border border-[rgba(167,139,250,0.15)] transition cursor-pointer"
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
          rooms={rooms}
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
function ClickPaymentModal({ isOpen, initialData, onClose, onSave, currency, rooms = [], t }) {
  const isEditing = Boolean(initialData);

  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [roomStation, setRoomStation] = useState(initialData?.roomStation || '');
  const [roomError, setRoomError] = useState('');
  const [amount, setAmount] = useState(initialData?.amount != null ? String(initialData.amount) : '');
  const [purpose, setPurpose] = useState(initialData?.purpose || 'session');
  const [transactionRef, setTransactionRef] = useState(initialData?.transactionRef || '');
  const [dateStr, setDateStr] = useState(initialData?.dateStr || toDateKey(new Date()));
  const [timeStr, setTimeStr] = useState(initialData?.timeStr || formatTimeDisplay(new Date()));
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Build existing rooms & stations list from opened rooms
  const availableRoomOptions = useMemo(() => {
    const list = [];
    (rooms || []).forEach((room) => {
      const rawRoomName = room.name || `${room.id}-PlayStation`;
      const localizedRoom = rawRoomName
        .replace(/^(\d+)-xona$/i, '$1-PlayStation')
        .replace(/^Room\s*(\d+)$/i, 'PlayStation $1');

      if (room.stations && room.stations.length > 0) {
        room.stations.forEach((st) => {
          const rawStName = st.stationName || `${st.stationNumber}-xona`;
          const localizedSt = rawStName
            .replace(/^Konsol\s*(\d+)$/i, '$1-xona')
            .replace(/^Station\s*(\d+)$/i, '$1-xona');
          list.push({
            value: `${localizedRoom} - ${localizedSt}`,
            label: `${localizedRoom} • ${localizedSt}`,
          });
        });
      } else {
        list.push({
          value: localizedRoom,
          label: localizedRoom,
        });
      }
    });
    return list;
  }, [rooms]);

  const parsedAmount = Number(amount) || 0;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Validate if rooms exist in the system
    if (!rooms || rooms.length === 0) {
      setRoomError(t('debts.roomNotExists'));
      alert(t('debts.roomNotExists'));
      return;
    }

    // 2. Validate room selection
    if (!roomStation || !roomStation.trim()) {
      setRoomError(t('debts.roomNotExists'));
      alert(t('debts.roomNotExists'));
      return;
    }

    const trimmed = roomStation.trim().toLowerCase();
    const exists = availableRoomOptions.some(
      (opt) =>
        opt.value.toLowerCase() === trimmed ||
        opt.label.toLowerCase() === trimmed ||
        opt.value.toLowerCase().includes(trimmed)
    );

    if (!exists) {
      setRoomError(t('debts.roomNotExists'));
      alert(t('debts.roomNotExists'));
      return;
    }

    if (!customerName.trim()) {
      alert(t('click.customerPlaceholder'));
      return;
    }

    if (parsedAmount <= 0) {
      alert(t('click.amountRequired'));
      return;
    }

    let purposeLabel = '';
    if (purpose === 'session') purposeLabel = t('click.purposeSession');
    else if (purpose === 'products') purposeLabel = t('click.purposeProducts');
    else if (purpose === 'debt') purposeLabel = t('click.purposeDebt');
    else purposeLabel = t('click.purposeOther');

    onSave({
      customerName: customerName.trim(),
      phone: phone.trim(),
      roomStation: roomStation.trim(),
      amount: parsedAmount,
      purpose,
      purposeLabel,
      transactionRef: transactionRef.trim() || undefined,
      dateStr,
      timeStr,
      notes: notes.trim(),
      status: 'completed',
    });
  };

  const modalNode = (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[100] animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] rounded-2xl max-w-xl w-full shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden text-white">
        {/* Modal Header */}
        <div className="shrink-0 p-5 border-b border-[rgba(167,139,250,0.15)] flex items-center justify-between bg-[#1D1B2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[rgba(167,139,250,0.25)] flex items-center justify-center text-[#A78BFA]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isEditing ? t('click.editPayment') : t('click.addPayment')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#7C3AED] text-white text-[9px] font-black uppercase">
                  CLICK
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                {isEditing ? initialData.customerName : t('click.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:bg-[#25233B] hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#A1A1AA] block mb-1">
                {t('click.customerName')} *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('click.customerPlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#101014] rounded-xl border border-[rgba(167,139,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] font-bold text-white"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#A1A1AA] block mb-1">
                {t('click.customerPhone')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('click.phonePlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#101014] rounded-xl border border-[rgba(167,139,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] text-white"
              />
            </div>
          </div>

          {/* Amount (So'm) */}
          <div className="p-3.5 rounded-xl bg-[#101014] border border-[rgba(167,139,250,0.15)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#A78BFA]" />
                <span>{t('click.amount')} *</span>
              </label>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {formatCurrency(parsedAmount, currency)}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="masalan: 35000"
                className="w-full px-3.5 py-2 text-sm bg-[#1D1B2E] rounded-xl border border-[rgba(167,139,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] font-mono font-bold text-white"
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[15000, 20000, 30000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-[#1D1B2E] hover:bg-[#25233B] text-[11px] font-bold text-[#A78BFA] border border-[rgba(167,139,250,0.2)] transition cursor-pointer"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#A1A1AA] block mb-1">
                {t('click.purpose')}
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#101014] rounded-xl border border-[rgba(167,139,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] font-bold text-white cursor-pointer"
              >
                <option value="session" className="bg-[#1D1B2E] text-white">{t('click.purposeSession')}</option>
                <option value="products" className="bg-[#1D1B2E] text-white">{t('click.purposeProducts')}</option>
                <option value="debt" className="bg-[#1D1B2E] text-white">{t('click.purposeDebt')}</option>
                <option value="other" className="bg-[#1D1B2E] text-white">{t('click.purposeOther')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#A1A1AA] block mb-1">
                {t('click.roomStation')} *
              </label>
              {rooms.length === 0 ? (
                <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t('debts.roomNotExists')}</span>
                </div>
              ) : (
                <select
                  value={roomStation}
                  onChange={(e) => {
                    setRoomStation(e.target.value);
                    setRoomError('');
                  }}
                  className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-[#101014] rounded-xl border focus:outline-none focus:ring-2 font-bold text-white cursor-pointer ${
                    roomError
                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-950/30'
                      : 'border-[rgba(167,139,250,0.2)] focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]'
                  }`}
                >
                  <option value="">{t('debts.selectRoomPlaceholder')}</option>
                  {availableRoomOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1D1B2E] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {roomError && (
                <span className="text-[11px] font-bold text-rose-400 mt-1 block">
                  {roomError}
                </span>
              )}
            </div>
          </div>

          {/* Transaction Ref & Date/Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#A1A1AA] block mb-1">
                {t('click.transactionRef')}
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder={t('click.refPlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#101014] rounded-xl border border-[rgba(167,139,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] font-mono text-white placeholder-[#A1A1AA]/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#A1A1AA] block mb-1">
                {t('click.dateTime')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-1/2 px-3 py-2 text-xs bg-[#101014] rounded-xl border border-[rgba(167,139,250,0.2)] font-mono text-white"
                />
                <input
                  type="text"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-1/2 px-3 py-2 text-xs bg-[#101014] rounded-xl border border-[rgba(167,139,250,0.2)] font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-[#A1A1AA] block mb-1">
              {t('click.notes')}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('click.notesPlaceholder')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#101014] rounded-xl border border-[rgba(167,139,250,0.2)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] text-white placeholder-[#A1A1AA]/50"
            />
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="shrink-0 p-4 bg-[#1D1B2E] border-t border-[rgba(167,139,250,0.15)] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:bg-[#25233B] hover:text-white font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            {t('click.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-2 py-2.5 px-6 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('click.savePayment')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
