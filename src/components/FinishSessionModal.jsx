import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Receipt, Timer, BellRing } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateGamingPayment, calculateProductTotals } from '../utils/calculations';
import { formatCurrency, formatDurationHuman, formatTimeDisplay } from '../utils/formatters';
import { stopAlarm } from '../utils/audioAlert';
import ProductInputTable from './ProductInputTable';

export default function FinishSessionModal({ station, isOpen, onClose }) {
  const { settings, finishSession } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  const [products, setProducts] = useState([]);
  const [customGamingPayment, setCustomGamingPayment] = useState('');
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  useEffect(() => {
    if (isOpen && station?.session) {
      stopAlarm(station.id);
      setNowTimestamp(Date.now());
      setProducts(station.session.products || []);
      const durationMs = Math.max(0, Date.now() - station.session.startTime);
      const autoPayment = calculateGamingPayment(durationMs, station.session.hourlyPrice);

      const defaultPayment =
        station.session.isTimed && station.session.targetBudget != null
          ? station.session.targetBudget
          : Math.round(autoPayment);

      setCustomGamingPayment(defaultPayment.toString());
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
      });
    } catch (err) {
      console.error('Error finishing session:', err);
    }

    onClose();
  };

  const localizedRoomName = t('rooms.roomN', { n: station.roomId });
  const localizedStationName = `${t('common.stationPrefix')} ${station.stationNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-hidden">
      <div className="bg-midnight-card rounded-2xl w-full max-w-2xl text-white shadow-2xl border border-midnight-border flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header — Always Visible */}
        <div className="shrink-0 px-5 py-3.5 bg-midnight-sidebar text-white flex items-center justify-between border-b border-midnight-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gaming-redBg text-gaming-red border border-gaming-red/30 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {t('sessionModal.finishTitle', {
                  room: localizedRoomName,
                  station: localizedStationName,
                })}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('sessionModal.customerLabel')}{' '}
                <span className="text-white font-medium">
                  {session.customerName || t('common.walkIn')}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-hover transition"
            title={t('common.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
          
          {/* Timed Session Badge if applicable */}
          {session.isTimed && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-primary/15 border border-cyan-primary/40 text-cyan-accent text-xs font-bold">
              <span className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-cyan-light shrink-0" />
                <span>
                  {t('sessionModal.timedBadge')}: {session.targetBudget != null ? formatCurrency(session.targetBudget, currency) : formatDurationHuman(session.targetDurationMs)}
                </span>
              </span>
              <span className="text-[11px] font-normal text-slate-300">
                Limitga yetganda avtomatik signal yangragan
              </span>
            </div>
          )}

          {/* Gaming Session Summary Card */}
          <div className="p-3.5 rounded-xl bg-midnight-bg border border-midnight-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              
              <div className="p-2 bg-midnight-card rounded-xl border border-midnight-border">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {t('sessionModal.startedAt')}
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block font-mono">
                  {formatTimeDisplay(session.startTime)}
                </span>
              </div>

              <div className="p-2 bg-midnight-card rounded-xl border border-midnight-border">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {t('sessionModal.endedAt')}
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block font-mono">
                  {formatTimeDisplay(nowTimestamp)}
                </span>
              </div>

              <div className="p-2 bg-brand-purple/15 rounded-xl border border-brand-purple/30">
                <span className="text-[10px] font-bold text-brand-purpleLight block uppercase">
                  {t('sessionModal.duration')}
                </span>
                <span className="text-sm font-black text-white mt-0.5 block font-mono">
                  {formatDurationHuman(durationMs)}
                </span>
              </div>

              <div className="p-2 bg-midnight-card rounded-xl border border-midnight-border">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {t('sessionModal.hourlyRate')}
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block font-mono truncate">
                  {formatCurrency(session.hourlyPrice, currency)}/soat
                </span>
              </div>

            </div>

            {/* Gaming Payment input */}
            <div className="mt-3 pt-3 border-t border-midnight-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-200 block">
                  {t('sessionModal.gamingPayment', {
                    amount: formatCurrency(autoGamingPayment, currency),
                  })}
                </label>
                <span className="text-[11px] text-slate-400">
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
                  className="w-full pl-3 pr-20 py-2 text-right font-bold text-base bg-midnight-card border border-midnight-border rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold pointer-events-none">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Product Sales Section */}
          <div className="border border-midnight-border rounded-xl p-3.5 bg-midnight-bg/40">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                {t('sessionModal.productsSoldToCustomer')}
              </h4>
              <span className="text-[11px] text-slate-400">
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
          <div className="p-3.5 rounded-xl bg-midnight-bg border border-brand-purple/30 text-white space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purpleLight mb-1.5">
              {t('sessionModal.checkoutSummary')}
            </h4>

            <div className="flex justify-between text-xs py-1 border-b border-midnight-border">
              <span className="text-slate-400">{t('sessionModal.gamingPaymentLabel')}</span>
              <span className="font-semibold text-white font-mono">
                {formatCurrency(finalGamingPayment, currency)}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-midnight-border">
              <span className="text-slate-400">
                {t('sessionModal.productSalesLabel', { count: validProducts.length })}
              </span>
              <span className="font-semibold text-white font-mono">
                {formatCurrency(productTotals.totalRevenue, currency)}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-midnight-border">
              <span className="text-slate-400">{t('sessionModal.productProfitLabel')}</span>
              <span className="font-semibold text-gaming-green font-mono">
                {formatCurrency(productTotals.totalProfit, currency)}
              </span>
            </div>

            <div className="pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {t('sessionModal.totalCustomerBill')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  {formatCurrency(totalAmountToCollect, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-brand-purpleLight block">
                  {t('sessionModal.yourTotalProfit')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-gaming-green font-mono">
                  {formatCurrency(totalProfit, currency)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Footer Action Buttons — Always Visible and Clickable */}
        <div className="shrink-0 px-5 py-3.5 bg-midnight-sidebar/95 border-t border-midnight-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-midnight-border text-slate-300 hover:bg-midnight-hover font-bold text-sm transition"
          >
            {t('sessionModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="flex-2 py-2.5 px-6 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-slate-950 font-black text-sm shadow-lg shadow-brand-purple/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('sessionModal.finishAndSaveBtn')}
          </button>
        </div>

      </div>
    </div>
  );
}
