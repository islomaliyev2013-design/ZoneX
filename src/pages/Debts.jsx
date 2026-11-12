import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ReceiptText,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Phone,
  Calendar,
  Gamepad2,
  ShoppingBag,
  AlertCircle,
  X,
  User,
  Users,
  Clock,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatTimeDisplay, toDateKey } from '../utils/formatters';

export default function Debts() {
  const {
    debts = [],
    settings = {},
    productsCatalog = [],
    addDebt,
    updateDebt,
    deleteDebt,
    markDebtAsPaid,
    totalUnpaidDebtAmount = 0,
    unpaidDebtsCount = 0,
    totalGamingDebt = 0,
    totalProductDebt = 0,
    totalPaidDebtAmount = 0,
  } = useApp();

  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);

  // Delete confirmation
  const [deletingDebtId, setDeletingDebtId] = useState(null);

  // Filtered debts list
  const filteredDebts = useMemo(() => {
    return debts.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = item.customerName?.toLowerCase().includes(query);
        const matchesPhone = item.phone?.toLowerCase().includes(query);
        const matchesRoom = item.roomStation?.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const matchesProducts = item.products?.some((p) =>
          p.name?.toLowerCase().includes(query)
        );
        return matchesName || matchesPhone || matchesRoom || matchesNotes || matchesProducts;
      }
      return true;
    });
  }, [debts, statusFilter, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingDebt(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = (id) => {
    if (window.confirm(t('debts.confirmDelete'))) {
      deleteDebt(id);
    }
  };

  const handleMarkPaid = (id) => {
    if (window.confirm(t('debts.confirmMarkPaid'))) {
      markDebtAsPaid(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E7E5E4] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs flex-shrink-0">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#292524] tracking-tight">
              {t('debts.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              {t('debts.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-sm transition active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('debts.addDebt')}</span>
        </button>
      </div>

      {/* 2. Top Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Unpaid Debt */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-red-50/70 border-2 border-red-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('debts.totalUnpaid')}
            </span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#DC2626] font-mono block">
              {formatCurrency(totalUnpaidDebtAmount, currency)}
            </span>
            <span className="text-[11px] font-bold text-red-600 mt-1 block">
              {unpaidDebtsCount} {t('debts.debtorsCount').toLowerCase()}
            </span>
          </div>
        </div>

        {/* Debtors Count */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('debts.debtorsCount')}
            </span>
            <Users className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#292524] font-mono block">
              {unpaidDebtsCount}
            </span>
            <span className="text-[11px] text-[#78716C] mt-1 block">
              {t('debts.unpaidDebts')}
            </span>
          </div>
        </div>

        {/* Gaming Debt */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('debts.totalGamingDebt')}
            </span>
            <Gamepad2 className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-[#292524] font-mono block">
              {formatCurrency(totalGamingDebt, currency)}
            </span>
            <span className="text-[11px] text-[#78716C] mt-1 block">
              PlayStation
            </span>
          </div>
        </div>

        {/* Product Debt */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E5E4] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#78716C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('debts.totalProductDebt')}
            </span>
            <ShoppingBag className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-[#292524] font-mono block">
              {formatCurrency(totalProductDebt, currency)}
            </span>
            <span className="text-[11px] text-[#78716C] mt-1 block">
              {t('nav.sales')}
            </span>
          </div>
        </div>

        {/* Total Paid / Repaid Debt */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-green-50/70 border border-green-200 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-green-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('debts.totalPaid')}
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-[#16A34A] font-mono block">
              {formatCurrency(totalPaidDebtAmount, currency)}
            </span>
            <span className="text-[11px] text-green-700 mt-1 block font-semibold">
              {debts.filter((d) => d.status === 'paid').length} {t('debts.statusPaid').toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7E5E4] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('debts.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-[#292524] placeholder-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:bg-white transition"
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-[#292524] shadow-xs'
                : 'text-[#78716C] hover:text-[#292524]'
            }`}
          >
            {t('debts.allDebts')} ({debts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'unpaid'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-[#DC2626] hover:bg-red-50'
            }`}
          >
            <span>{t('debts.unpaidDebts')}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'unpaid' ? 'bg-white/20' : 'bg-red-100'}`}>
              {unpaidDebtsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'paid'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'text-[#16A34A] hover:bg-green-50'
            }`}
          >
            <span>{t('debts.paidDebts')}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'paid' ? 'bg-white/20' : 'bg-green-100'}`}>
              {debts.filter((d) => d.status === 'paid').length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Debts List / Table */}
      {filteredDebts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center mx-auto mb-3 text-[#78716C]">
            <ReceiptText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#292524]">{t('debts.emptyStateTitle')}</h3>
          <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">{t('debts.emptyStateDesc')}</p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D9488] text-white text-xs font-bold hover:bg-[#0F766E] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('debts.addDebt')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((debt) => {
            const isUnpaid = debt.status === 'unpaid';
            const userInitial = (debt.customerName?.[0] || 'M').toUpperCase();

            return (
              <div
                key={debt.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isUnpaid
                    ? 'border-red-200 hover:border-red-300'
                    : 'border-[#E7E5E4] bg-stone-50/40 opacity-90'
                }`}
              >
                {/* Left: Customer Info & Meta */}
                <div className="flex items-start gap-3.5 min-w-[240px]">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs ${
                      isUnpaid
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}
                  >
                    {userInitial}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-[#292524] leading-tight">
                        {debt.customerName}
                      </h3>
                      {debt.roomStation && (
                        <span className="px-2 py-0.5 rounded-md bg-[#F5F5F4] border border-[#E7E5E4] text-[10px] font-bold text-[#78716C]">
                          {debt.roomStation}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#78716C] flex-wrap">
                      {debt.phone && (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>{debt.phone}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#78716C]" />
                        <span>
                          {debt.dateStr} {debt.timeStr}
                        </span>
                      </span>
                    </div>

                    {debt.notes && (
                      <p className="text-xs text-[#57534E] italic bg-[#F5F5F4] px-2.5 py-1 rounded-md border border-[#E7E5E4] inline-block">
                        {debt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Center: Breakdown (Gaming charge + Products taken) */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 lg:px-6 lg:border-x lg:border-[#E7E5E4] min-w-[320px]">
                  {/* Gaming Charge */}
                  <div className="p-2.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4]">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#78716C] uppercase mb-0.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{t('debts.totalGamingDebt')}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-[#292524] font-mono">
                      {formatCurrency(debt.gameplayAmount || 0, currency)}
                    </span>
                  </div>

                  {/* Products Taken */}
                  <div className="p-2.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4]">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#78716C] uppercase mb-0.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{t('debts.productsTaken')}</span>
                    </div>
                    {debt.products && debt.products.length > 0 ? (
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm font-black text-[#0D9488] font-mono block">
                          {formatCurrency(debt.productsAmount || 0, currency)}
                        </span>
                        <div className="text-[10px] text-[#78716C] truncate max-w-[200px]" title={debt.products.map(p => `${p.name} (${p.quantity} ta)`).join(', ')}>
                          {debt.products.map(p => `${p.name} (${p.quantity})`).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#78716C]">{t('debts.noProducts')}</span>
                    )}
                  </div>
                </div>

                {/* Right: Total Debt, Status Badge & Action Buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-4 min-w-[240px]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#78716C] block">
                      {t('debts.totalDebtAmount')}
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-black font-mono block ${
                        isUnpaid ? 'text-[#DC2626]' : 'text-[#16A34A]'
                      }`}
                    >
                      {formatCurrency(debt.totalDebt || 0, currency)}
                    </span>
                    {isUnpaid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        <span>{t('debts.statusUnpaid')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('debts.statusPaid')}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {isUnpaid && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(debt.id)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                        title={t('debts.markAsPaid')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('debts.markAsPaid')}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(debt)}
                      className="p-2 rounded-xl bg-[#F5F5F4] hover:bg-stone-200 text-[#44403C] border border-[#E7E5E4] transition cursor-pointer"
                      title={t('debts.editDebt')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(debt.id)}
                      className="p-2 rounded-xl bg-white hover:bg-red-50 text-[#78716C] hover:text-[#DC2626] border border-[#E7E5E4] hover:border-red-200 transition cursor-pointer"
                      title={t('debts.deleteDebt')}
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

      {/* 5. Add / Edit Debt Modal */}
      {isModalOpen && (
        <DebtModal
          isOpen={isModalOpen}
          initialData={editingDebt}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            if (editingDebt) {
              updateDebt(editingDebt.id, data);
            } else {
              addDebt(data);
            }
            setIsModalOpen(false);
          }}
          currency={currency}
          productsCatalog={productsCatalog}
          t={t}
        />
      )}
    </div>
  );
}

/**
 * Add / Edit Debt Modal Form
 * Mounted to document.body via createPortal with z-[100]
 */
function DebtModal({ isOpen, initialData, onClose, onSave, currency, productsCatalog = [], t }) {
  const isEditing = Boolean(initialData);

  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [roomStation, setRoomStation] = useState(initialData?.roomStation || '');
  const [gameplayAmount, setGameplayAmount] = useState(
    initialData?.gameplayAmount != null ? String(initialData.gameplayAmount) : ''
  );
  const [dateStr, setDateStr] = useState(initialData?.dateStr || toDateKey(new Date()));
  const [timeStr, setTimeStr] = useState(initialData?.timeStr || formatTimeDisplay(new Date()));
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [status, setStatus] = useState(initialData?.status || 'unpaid');

  // Products array: [ { name, quantity, price, total } ]
  const [products, setProducts] = useState(() => {
    if (initialData?.products && Array.isArray(initialData.products) && initialData.products.length > 0) {
      return initialData.products.map((p) => ({
        name: p.name || '',
        quantity: p.quantity || 1,
        sellingPrice: p.sellingPrice != null ? p.sellingPrice : (p.price != null ? p.price : 0),
      }));
    }
    return [];
  });

  const parsedGaming = Number(gameplayAmount) || 0;
  const parsedProductsAmount = products.reduce(
    (sum, p) => sum + (Number(p.quantity) || 1) * (Number(p.sellingPrice) || 0),
    0
  );
  const computedTotal = parsedGaming + parsedProductsAmount;

  const handleAddProductRow = () => {
    setProducts((prev) => [...prev, { name: '', quantity: 1, sellingPrice: 0 }]);
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // If selecting from catalog, auto-fill price
        if (field === 'name') {
          const match = productsCatalog.find((c) => c.name.toLowerCase() === value.toLowerCase());
          if (match && match.sellingPrice) {
            updated.sellingPrice = match.sellingPrice;
          }
        }
        return updated;
      })
    );
  };

  const handleRemoveProductRow = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!customerName.trim()) {
      alert(t('debts.customerNamePlaceholder'));
      return;
    }

    const cleanProducts = products
      .filter((p) => p.name && p.name.trim() !== '')
      .map((p) => ({
        name: p.name.trim(),
        quantity: Number(p.quantity) || 1,
        sellingPrice: Number(p.sellingPrice) || 0,
        total: (Number(p.quantity) || 1) * (Number(p.sellingPrice) || 0),
      }));

    onSave({
      customerName: customerName.trim(),
      phone: phone.trim(),
      roomStation: roomStation.trim(),
      gameplayAmount: parsedGaming,
      products: cleanProducts,
      productsAmount: parsedProductsAmount,
      totalDebt: computedTotal,
      dateStr,
      timeStr,
      notes: notes.trim(),
      status,
    });
  };

  const modalNode = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[100] animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E7E5E4] rounded-2xl max-w-xl w-full shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="shrink-0 p-5 border-b border-[#E7E5E4] flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#292524]">
                {isEditing ? t('debts.editDebt') : t('debts.addDebt')}
              </h3>
              <p className="text-xs text-[#78716C]">
                {isEditing ? initialData.customerName : t('debts.subtitle')}
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('debts.customerName')} *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('debts.customerNamePlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-bold text-[#292524]"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('debts.customerPhone')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('debts.customerPhonePlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-[#292524]"
              />
            </div>
          </div>

          {/* Room / Station & Date/Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('debts.roomStation')}
              </label>
              <input
                type="text"
                value={roomStation}
                onChange={(e) => setRoomStation(e.target.value)}
                placeholder={t('debts.roomStationPlaceholder')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-[#292524]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#44403C] block mb-1">
                {t('debts.dateTime')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-1/2 px-3 py-2 text-xs bg-white rounded-xl border border-[#E7E5E4] font-mono text-[#292524]"
                />
                <input
                  type="text"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-1/2 px-3 py-2 text-xs bg-white rounded-xl border border-[#E7E5E4] font-mono text-[#292524]"
                />
              </div>
            </div>
          </div>

          {/* Gaming Time Amount (Necha puli o'tirgani) */}
          <div className="p-3.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#292524] flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-[#0D9488]" />
                <span>{t('debts.gameplayAmount')}</span>
              </label>
              <span className="text-xs font-bold text-[#0D9488] font-mono">
                {formatCurrency(parsedGaming, currency)}
              </span>
            </div>

            <input
              type="number"
              min="0"
              step="1000"
              value={gameplayAmount}
              onChange={(e) => setGameplayAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono font-bold text-[#292524]"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[10000, 15000, 20000, 30000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setGameplayAmount(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-[11px] font-bold text-[#57534E] border border-[#E7E5E4] transition cursor-pointer"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Products Section (Nimalar oldi) */}
          <div className="p-3.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#292524] flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#0D9488]" />
                <span>{t('debts.productsTaken')}</span>
              </label>
              <button
                type="button"
                onClick={handleAddProductRow}
                className="px-2.5 py-1 rounded-lg bg-[#0D9488] text-white text-[11px] font-bold hover:bg-[#0F766E] transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{t('debts.addProductRow')}</span>
              </button>
            </div>

            {products.length === 0 ? (
              <p className="text-xs text-[#78716C] italic py-1">
                {t('debts.noProducts')}
              </p>
            ) : (
              <div className="space-y-2">
                {products.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E7E5E4]"
                  >
                    {/* Catalog Quick Select or Name */}
                    <div className="flex-1">
                      <input
                        type="text"
                        list={`cat-list-${idx}`}
                        value={item.name}
                        onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                        placeholder={t('debts.productName')}
                        className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:outline-none font-semibold text-[#292524]"
                      />
                      <datalist id={`cat-list-${idx}`}>
                        {productsCatalog.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} ({formatCurrency(c.sellingPrice, currency)})
                          </option>
                        ))}
                      </datalist>
                    </div>

                    {/* Qty */}
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleProductChange(idx, 'quantity', e.target.value)}
                      className="w-14 px-2 py-1 text-xs bg-[#F5F5F4] rounded-lg border border-[#E7E5E4] text-center font-bold text-[#292524]"
                      title={t('debts.productQty')}
                    />

                    {/* Price */}
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={item.sellingPrice}
                      onChange={(e) => handleProductChange(idx, 'sellingPrice', e.target.value)}
                      className="w-24 px-2 py-1 text-xs bg-[#F5F5F4] rounded-lg border border-[#E7E5E4] font-mono font-bold text-right text-[#292524]"
                      title={t('debts.productPrice')}
                    />

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveProductRow(idx)}
                      className="p-1 rounded-lg text-[#78716C] hover:text-[#DC2626] transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-[#44403C] block mb-1">
              {t('debts.notes')}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('debts.notesPlaceholder')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-[#292524]"
            />
          </div>

          {/* Total Debt Calculation Box */}
          <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                {t('debts.totalDebtAmount')}
              </span>
              <div className="text-xs text-[#78716C] mt-0.5">
                {t('debts.totalGamingDebt')}: {formatCurrency(parsedGaming, currency)} + {t('debts.totalProductDebt')}: {formatCurrency(parsedProductsAmount, currency)}
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-black text-[#DC2626] font-mono">
              {formatCurrency(computedTotal, currency)}
            </span>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="shrink-0 p-4 bg-stone-50 border-t border-[#E7E5E4] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E7E5E4] text-[#78716C] hover:bg-white hover:text-[#292524] font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            {t('debts.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-2 py-2.5 px-6 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('debts.saveDebt')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}

