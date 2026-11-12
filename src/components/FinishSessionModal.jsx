import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X, Receipt, Timer, ReceiptText, Coins, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateGamingPayment, calculateProductTotals } from '../utils/calculations';
import { formatCurrency, formatDurationHuman, formatTimeDisplay } from '../utils/formatters';
import { stopAlarm } from '../utils/audioAlert';
import ProductInputTable from './ProductInputTable';

export default function FinishSessionModal({ station, isOpen, onClose }) {
  const { settings, finishSession, finishSessionAsDebt } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  const [products, setProducts] = useState([]);
  const [customGamingPayment, setCustomGamingPayment] = useState('');
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [showDebtDrawer, setShowDebtDrawer] = useState(false);
  const [debtCustomerName, setDebtCustomerName] = useState('');
  const [debtPhone, setDebtPhone] = useState('');
  const [debtNotes, setDebtNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'click'
  const [transactionRef, setTransactionRef] = useState('');

  useEffect(() => {
    if (isOpen && station?.session) {
      stopAlarm(station.id);
      setNowTimestamp(Date.now());
      setProducts(station.session.products || []);
      const durationMs = Math.max(0, Date.now() - station.session.startTime);
      const autoPayment = calculateGamingPayment(durationMs, station.session.hourlyPrice);

      const isExpired =
        station.session.isTimed &&
        station.session.targetEndTime &&
        Date.now() >= station.session.targetEndTime;

      let defaultPayment;
      if (isExpired && station.session.targetBudget != null) {
        defaultPayment = station.session.targetBudget;
      } else if (station.session.targetBudget != null) {
        defaultPayment = Math.min(station.session.targetBudget, Math.round(autoPayment));
      } else {
        defaultPayment = Math.round(autoPayment);
      }

      setCustomGamingPayment(defaultPayment.toString());

      if (
        station.session.customerName &&
        station.session.customerName !== 'Walk-in' &&
        station.session.customerName !== 'Nomsiz mijoz'
      ) {
        setDebtCustomerName(station.session.customerName);
      } else {
        setDebtCustomerName('');
      }
      setDebtPhone('');
      setDebtNotes('');
      setShowDebtDrawer(false);
      setPaymentMethod('cash');
      setTransactionRef('');
    }
  }, [isOpen, station]);

  if (!isOpen || !station || !station.session) return null;

  const session = station.session;
  const durationMs = Math.max(0, nowTimestamp - session.startTime);
  const autoGamingPayment = calculateGamingPayment(durationMs, session.hourlyPrice);

  const finalGamingPayment =
    customGamingPayment !== '' && !isNaN(Number(customGamingPayment))
      ? Number(customGamingPayment)
      : autoGamingPayment;

  // Clean products
  const validProducts = products.filter(
    (p) => p.name && p.name.trim() !== '' && Number(p.quantity) > 0
  );
  const productTotals = calculateProductTotals(validProducts);

  const totalAmountToCollect = finalGamingPayment + productTotals.totalRevenue;
  const totalProfit = finalGamingPayment + productTotals.totalProfit;

  const handleFinish = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      finishSession(station.id, {
        finalGamingPayment,
        finalProducts: validProducts.map((p) => ({
          name: p.name.trim(),
          quantity: Number(p.quantity) || 1,
          purchasePrice: Number(p.purchasePrice) || 0,
          sellingPrice: Number(p.sellingPrice) || 0,
          totalCost: (Number(p.quantity) || 1) * (Number(p.purchasePrice) || 0),
          totalRevenue: (Number(p.quantity) || 1) * (Number(p.sellingPrice) || 0),
          profit:
            (Number(p.quantity) || 1) * (Number(p.sellingPrice) || 0) -
            (Number(p.quantity) || 1) * (Number(p.purchasePrice) || 0),
        })),
        paymentMethod,
        transactionRef,
      });
    } catch (err) {
      console.error('Error finishing session:', err);
    }

    onClose();
  };

  const handleRecordAsDebt = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      const finalName = debtCustomerName.trim() || session.customerName || 'Nomsiz';
      finishSessionAsDebt(station.id, {
        customerName: finalName,
        phone: debtPhone.trim(),
        notes: debtNotes.trim(),
        finalGamingPayment,
        finalProducts: validProducts.map((p) => ({
          name: p.name.trim(),
          quantity: Number(p.quantity) || 1,
          purchasePrice: Number(p.purchasePrice) || 0,
          sellingPrice: Number(p.sellingPrice) || 0,
          totalCost: (Number(p.quantity) || 1) * (Number(p.purchasePrice) || 0),
          totalRevenue: (Number(p.quantity) || 1) * (Number(p.sellingPrice) || 0),
          profit:
            (Number(p.quantity) || 1) * (Number(p.sellingPrice) || 0) -
            (Number(p.quantity) || 1) * (Number(p.purchasePrice) || 0),
        })),
        paymentMethod,
        transactionRef,
      });
    } catch (err) {
      console.error('Error recording debt:', err);
    }

    onClose();
  };

  const rawRoomName = station.roomName || `${station.roomId}-PlayStation`;
  const localizedRoomName = rawRoomName
    .replace(/^(\d+)-xona$/i, '$1-PlayStation')
    .replace(/^Room\s*(\d+)$/i, 'PlayStation $1');

  const rawStationName = station.stationName || `${station.stationNumber}-xona`;
  const localizedStationName = rawStationName
    .replace(/^Konsol\s*(\d+)$/i, '$1-xona')
    .replace(/^Station\s*(\d+)$/i, '$1-xona');

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-5 overflow-hidden">
      <div className="bg-[#1D1B2E] rounded-2xl w-full max-w-2xl text-white shadow-2xl border border-[rgba(167,139,250,0.15)] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header — Always Visible */}
        <div className="shrink-0 px-5 py-3.5 bg-[#1D1B2E] text-white flex items-center justify-between border-b border-[rgba(167,139,250,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                {t('sessionModal.finishTitle', {
                  room: localizedRoomName,
                  station: localizedStationName,
                })}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {t('sessionModal.customerLabel')}{' '}
                <span className="text-white font-bold">
                  {session.customerName || t('common.walkIn')}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#101014] transition cursor-pointer"
            title={t('common.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* Timed Session Badge if applicable */}
          {session.isTimed && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A78BFA] text-xs font-bold">
              <span className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#A78BFA] shrink-0" />
                <span>
                  {t('sessionModal.timedBadge')}: {session.targetBudget != null ? formatCurrency(session.targetBudget, currency) : formatDurationHuman(session.targetDurationMs)}
                </span>
              </span>
              <span className="text-[11px] font-normal text-[#A1A1AA]">
                Limitga yetganda avtomatik signal yangragan
              </span>
            </div>
          )}

          {/* Gaming Session Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#101014] border border-[rgba(167,139,250,0.15)]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              
              <div className="p-2 bg-[#1D1B2E] rounded-xl border border-[rgba(167,139,250,0.15)]">
                <span className="text-[10px] font-bold text-[#A1A1AA] block uppercase">
                  {t('sessionModal.startedAt')}
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block font-mono">
                  {formatTimeDisplay(session.startTime)}
                </span>
              </div>

              <div className="p-2 bg-[#1D1B2E] rounded-xl border border-[rgba(167,139,250,0.15)]">
                <span className="text-[10px] font-bold text-[#A1A1AA] block uppercase">
                  {t('sessionModal.endedAt')}
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block font-mono">
                  {formatTimeDisplay(nowTimestamp)}
                </span>
              </div>

              <div className="p-2 bg-[#7C3AED]/20 rounded-xl border border-[rgba(167,139,250,0.3)]">
                <span className="text-[10px] font-bold text-[#A78BFA] block uppercase">
                  {t('sessionModal.duration')}
                </span>
                <span className="text-sm font-extrabold text-[#A78BFA] mt-0.5 block font-mono">
                  {formatDurationHuman(durationMs)}
                </span>
              </div>

              <div className="p-2 bg-[#1D1B2E] rounded-xl border border-[rgba(167,139,250,0.15)]">
                <span className="text-[10px] font-bold text-[#A1A1AA] block uppercase">
                  {t('sessionModal.hourlyRate')}
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block font-mono truncate">
                  {formatCurrency(session.hourlyPrice, currency)}/soat
                </span>
              </div>

            </div>

            {/* Gaming Payment input */}
            <div className="mt-3 pt-3 border-t border-[rgba(167,139,250,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-xs font-bold text-white block">
                  {t('sessionModal.gamingPayment', {
                    amount: formatCurrency(autoGamingPayment, currency),
                  })}
                </label>
                <span className="text-[11px] text-[#A1A1AA]">
                  {t('sessionModal.autoComputedHint')}
                </span>
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customGamingPayment}
                  onChange={(e) => setCustomGamingPayment(e.target.value)}
                  className="w-full pl-3 pr-20 py-2 text-right font-bold text-base bg-[#1D1B2E] border border-[rgba(167,139,250,0.2)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                />
                <span className="absolute right-3 top-2.5 text-[#A1A1AA] text-xs font-bold pointer-events-none">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Product Sales Section */}
          <div className="border border-[rgba(167,139,250,0.15)] rounded-xl p-3.5 bg-[#101014]/60">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                {t('sessionModal.productsSoldToCustomer')}
              </h4>
              <span className="text-[11px] text-[#A1A1AA]">
                {t('sessionModal.drinksSnacksHint')}
              </span>
            </div>

            <ProductInputTable
              products={products}
              onChange={setProducts}
              showQuickChips={true}
            />
          </div>

          {/* Grand Receipt Summary */}
          <div className="p-3.5 rounded-xl bg-[#7C3AED]/15 border border-[rgba(167,139,250,0.25)] text-white space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] mb-1.5">
              {t('sessionModal.checkoutSummary')}
            </h4>

            <div className="flex justify-between text-xs py-1 border-b border-[rgba(167,139,250,0.15)]">
              <span className="text-[#A1A1AA]">{t('sessionModal.gamingPaymentLabel')}</span>
              <span className="font-bold text-white font-mono">
                {formatCurrency(finalGamingPayment, currency)}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-[rgba(167,139,250,0.15)]">
              <span className="text-[#A1A1AA]">
                {t('sessionModal.productSalesLabel', { count: validProducts.length })}
              </span>
              <span className="font-bold text-[#A78BFA] font-mono">
                {formatCurrency(productTotals.totalRevenue, currency)}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-[rgba(167,139,250,0.15)]">
              <span className="text-[#A1A1AA]">{t('sessionModal.productProfitLabel')}</span>
              <span className="font-extrabold text-emerald-400 font-mono">
                {formatCurrency(productTotals.totalProfit, currency)}
              </span>
            </div>

            <div className="pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#A1A1AA] block">
                  {t('sessionModal.totalCustomerBill')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {formatCurrency(totalAmountToCollect, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#A78BFA] block">
                  {t('sessionModal.yourTotalProfit')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {formatCurrency(totalProfit, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector (Naqd vs Click) */}
          <div className="p-3.5 rounded-xl bg-[#101014] border border-[rgba(167,139,250,0.15)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                {t('sessionModal.paymentMethodLabel')}
              </span>
              <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md ${
                paymentMethod === 'click' ? 'bg-[#00A5EC]/20 text-[#00A5EC] border border-[#00A5EC]/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {paymentMethod === 'click' ? 'Click' : t('sessionModal.methodCash')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.3)] font-black'
                    : 'bg-[#1D1B2E] text-[#A1A1AA] border-[rgba(167,139,250,0.15)] hover:text-white hover:border-[#7C3AED]/40'
                }`}
              >
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>{t('sessionModal.methodCash')}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('click')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                  paymentMethod === 'click'
                    ? 'bg-[#00A5EC] text-white border-[#00A5EC] shadow-[0_0_15px_rgba(0,165,236,0.3)] font-black'
                    : 'bg-[#1D1B2E] text-[#A1A1AA] border-[rgba(167,139,250,0.15)] hover:text-white hover:border-[#00A5EC]/40'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{t('sessionModal.methodClick')}</span>
              </button>
            </div>

            {paymentMethod === 'click' && (
              <div className="pt-1 animate-in fade-in">
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder={t('sessionModal.transactionRefPlaceholder')}
                  className="w-full px-3 py-2 text-xs bg-[#1D1B2E] rounded-lg border border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-[#00A5EC] text-white placeholder-[#A1A1AA]/50 font-medium"
                />
              </div>
            )}
          </div>

          {/* Debt Form Drawer */}
          {showDebtDrawer && (
            <div className="p-4 rounded-xl bg-[#101014] border-2 border-amber-500/40 text-white space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    {t('sessionModal.recordDebtDrawerTitle')}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDebtDrawer(false)}
                  className="text-xs text-[#A1A1AA] hover:text-white underline cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#A1A1AA] block mb-1">
                    {t('debts.customerName')} *
                  </label>
                  <input
                    type="text"
                    value={debtCustomerName}
                    onChange={(e) => setDebtCustomerName(e.target.value)}
                    placeholder={t('debts.customerNamePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-[#1D1B2E] rounded-lg border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-white placeholder-[#A1A1AA]/50"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#A1A1AA] block mb-1">
                    {t('debts.customerPhone')}
                  </label>
                  <input
                    type="text"
                    value={debtPhone}
                    onChange={(e) => setDebtPhone(e.target.value)}
                    placeholder={t('debts.customerPhonePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-[#1D1B2E] rounded-lg border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-[#A1A1AA]/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#A1A1AA] block mb-1">
                  {t('debts.notes')}
                </label>
                <input
                  type="text"
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  placeholder={t('debts.notesPlaceholder')}
                  className="w-full px-3 py-2 text-xs bg-[#1D1B2E] rounded-lg border border-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-[#A1A1AA]/50"
                />
              </div>

              <button
                type="button"
                onClick={handleRecordAsDebt}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ReceiptText className="w-4 h-4" />
                {t('sessionModal.confirmRecordDebt')} ({formatCurrency(totalAmountToCollect, currency)})
              </button>
            </div>
          )}

        </div>

        {/* Sticky Footer Action Buttons — Always Visible and Clickable */}
        <div className="shrink-0 px-5 py-3.5 bg-[#1D1B2E] border-t border-[rgba(167,139,250,0.15)] flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:bg-[#101014] hover:text-white font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            {t('sessionModal.cancel')}
          </button>
          <button
            type="button"
            onClick={() => setShowDebtDrawer((prev) => !prev)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer border ${
              showDebtDrawer
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>{t('sessionModal.recordAsDebtBtn')}</span>
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="flex-2 py-2.5 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('sessionModal.finishAndSaveBtn')}</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
