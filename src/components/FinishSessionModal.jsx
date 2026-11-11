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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-3 sm:p-5 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-2xl text-[#292524] shadow-2xl border border-[#E7E5E4] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header — Always Visible */}
        <div className="shrink-0 px-5 py-3.5 bg-white text-[#292524] flex items-center justify-between border-b border-[#E7E5E4]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#DC2626] border border-red-200 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#292524] leading-tight">
                {t('sessionModal.finishTitle', {
                  room: localizedRoomName,
                  station: localizedStationName,
                })}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t('sessionModal.customerLabel')}{' '}
                <span className="text-[#292524] font-bold">
                  {session.customerName || t('common.walkIn')}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#292524] hover:bg-[#F5F5F4] transition cursor-pointer"
            title={t('common.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* Timed Session Badge if applicable */}
          {session.isTimed && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] text-xs font-bold">
              <span className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#0D9488] shrink-0" />
                <span>
                  {t('sessionModal.timedBadge')}: {session.targetBudget != null ? formatCurrency(session.targetBudget, currency) : formatDurationHuman(session.targetDurationMs)}
                </span>
              </span>
              <span className="text-[11px] font-normal text-[#78716C]">
                Limitga yetganda avtomatik signal yangragan
              </span>
            </div>
          )}

          {/* Gaming Session Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              
              <div className="p-2 bg-white rounded-xl border border-[#E7E5E4]">
                <span className="text-[10px] font-bold text-[#78716C] block uppercase">
                  {t('sessionModal.startedAt')}
                </span>
                <span className="text-sm font-bold text-[#292524] mt-0.5 block font-mono">
                  {formatTimeDisplay(session.startTime)}
                </span>
              </div>

              <div className="p-2 bg-white rounded-xl border border-[#E7E5E4]">
                <span className="text-[10px] font-bold text-[#78716C] block uppercase">
                  {t('sessionModal.endedAt')}
                </span>
                <span className="text-sm font-bold text-[#292524] mt-0.5 block font-mono">
                  {formatTimeDisplay(nowTimestamp)}
                </span>
              </div>

              <div className="p-2 bg-[#F0FDFA] rounded-xl border border-[#CCFBF1]">
                <span className="text-[10px] font-bold text-[#0D9488] block uppercase">
                  {t('sessionModal.duration')}
                </span>
                <span className="text-sm font-extrabold text-[#0D9488] mt-0.5 block font-mono">
                  {formatDurationHuman(durationMs)}
                </span>
              </div>

              <div className="p-2 bg-white rounded-xl border border-[#E7E5E4]">
                <span className="text-[10px] font-bold text-[#78716C] block uppercase">
                  {t('sessionModal.hourlyRate')}
                </span>
                <span className="text-sm font-bold text-[#292524] mt-0.5 block font-mono truncate">
                  {formatCurrency(session.hourlyPrice, currency)}/soat
                </span>
              </div>

            </div>

            {/* Gaming Payment input */}
            <div className="mt-3 pt-3 border-t border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-xs font-bold text-[#292524] block">
                  {t('sessionModal.gamingPayment', {
                    amount: formatCurrency(autoGamingPayment, currency),
                  })}
                </label>
                <span className="text-[11px] text-[#78716C]">
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
                  className="w-full pl-3 pr-20 py-2 text-right font-bold text-base bg-white border border-[#E7E5E4] rounded-xl text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
                />
                <span className="absolute right-3 top-2.5 text-[#78716C] text-xs font-bold pointer-events-none">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Product Sales Section */}
          <div className="border border-[#E7E5E4] rounded-xl p-3.5 bg-[#F5F5F4]/40">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-[#292524] uppercase tracking-wide">
                {t('sessionModal.productsSoldToCustomer')}
              </h4>
              <span className="text-[11px] text-[#78716C]">
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
          <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4]/80 text-[#292524] space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D9488] mb-1.5">
              {t('sessionModal.checkoutSummary')}
            </h4>

            <div className="flex justify-between text-xs py-1 border-b border-[#E7E5E4]">
              <span className="text-[#78716C]">{t('sessionModal.gamingPaymentLabel')}</span>
              <span className="font-bold text-[#292524] font-mono">
                {formatCurrency(finalGamingPayment, currency)}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-[#E7E5E4]">
              <span className="text-[#78716C]">
                {t('sessionModal.productSalesLabel', { count: validProducts.length })}
              </span>
              <span className="font-bold text-[#0D9488] font-mono">
                {formatCurrency(productTotals.totalRevenue, currency)}
              </span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-[#E7E5E4]">
              <span className="text-[#78716C]">{t('sessionModal.productProfitLabel')}</span>
              <span className="font-extrabold text-[#16A34A] font-mono">
                {formatCurrency(productTotals.totalProfit, currency)}
              </span>
            </div>

            <div className="pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#78716C] block">
                  {t('sessionModal.totalCustomerBill')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#292524] font-mono">
                  {formatCurrency(totalAmountToCollect, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#0D9488] block">
                  {t('sessionModal.yourTotalProfit')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#16A34A] font-mono">
                  {formatCurrency(totalProfit, currency)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Footer Action Buttons — Always Visible and Clickable */}
        <div className="shrink-0 px-5 py-3.5 bg-white border-t border-[#E7E5E4] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#292524] font-bold text-sm transition cursor-pointer"
          >
            {t('sessionModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="flex-2 py-2.5 px-6 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('sessionModal.finishAndSaveBtn')}
          </button>
        </div>

      </div>
    </div>
  );
}
