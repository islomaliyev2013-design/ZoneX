import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateGamingPayment, calculateProductTotals } from '../utils/calculations';
import { formatCurrency, formatDurationHuman, formatTimeDisplay } from '../utils/formatters';
import ProductInputTable from './ProductInputTable';

export default function FinishSessionModal({ station, isOpen, onClose }) {
  const { settings, finishSession } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || '$';

  const [products, setProducts] = useState([]);
  const [customGamingPayment, setCustomGamingPayment] = useState('');
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  useEffect(() => {
    if (isOpen && station?.session) {
      setNowTimestamp(Date.now());
      setProducts(station.session.products || []);
      const durationMs = Math.max(0, Date.now() - station.session.startTime);
      const autoPayment = calculateGamingPayment(durationMs, station.session.hourlyPrice);
      setCustomGamingPayment(autoPayment.toFixed(2));
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
    e.preventDefault();

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

    onClose();
  };

  const localizedRoomName = t('rooms.roomN', { n: station.roomId });
  const localizedStationName = `${t('common.stationPrefix')} ${station.stationNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl text-slate-800 shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {t('sessionModal.finishTitle', {
                  room: localizedRoomName,
                  station: localizedStationName,
                })}
              </h3>
              <p className="text-xs text-slate-400">
                {t('sessionModal.customerLabel')}{' '}
                <span className="text-white font-medium">
                  {session.customerName || t('common.walkIn')}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleFinish} className="p-6 space-y-6">
          
          {/* Gaming Session Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              
              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  {t('sessionModal.startedAt')}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatTimeDisplay(session.startTime)}
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  {t('sessionModal.endedAt')}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatTimeDisplay(nowTimestamp)}
                </span>
              </div>

              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-[11px] font-bold text-blue-500 block uppercase">
                  {t('sessionModal.duration')}
                </span>
                <span className="text-sm font-extrabold text-blue-700">
                  {formatDurationHuman(durationMs)}
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  {t('sessionModal.hourlyRate')}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatCurrency(session.hourlyPrice, currency)}/hr
                </span>
              </div>

            </div>

            {/* Gaming Payment input */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block">
                  {t('sessionModal.gamingPayment', {
                    amount: formatCurrency(autoGamingPayment, currency),
                  })}
                </label>
                <span className="text-[11px] text-slate-400">
                  {t('sessionModal.autoComputedHint')}
                </span>
              </div>

              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-2 text-slate-400 text-sm font-bold">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customGamingPayment}
                  onChange={(e) => setCustomGamingPayment(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-right font-bold text-base bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Sales Section */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">
                {t('sessionModal.productsSoldToCustomer')}
              </h4>
              <span className="text-xs text-slate-400">
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
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t('sessionModal.checkoutSummary')}
            </h4>

            <div className="flex justify-between text-sm py-1 border-b border-slate-800">
              <span className="text-slate-300">{t('sessionModal.gamingPaymentLabel')}</span>
              <span className="font-semibold text-white">
                {formatCurrency(finalGamingPayment, currency)}
              </span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b border-slate-800">
              <span className="text-slate-300">
                {t('sessionModal.productSalesLabel', { count: validProducts.length })}
              </span>
              <span className="font-semibold text-white">
                {formatCurrency(productTotals.totalRevenue, currency)}
              </span>
            </div>

            <div className="flex justify-between text-sm py-1 border-b border-slate-800">
              <span className="text-slate-300">{t('sessionModal.productProfitLabel')}</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(productTotals.profit, currency)}
              </span>
            </div>

            <div className="pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 block">
                  {t('sessionModal.totalCustomerBill')}
                </span>
                <span className="text-2xl font-extrabold text-white">
                  {formatCurrency(totalAmountToCollect, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase text-emerald-400 block">
                  {t('sessionModal.yourTotalProfit')}
                </span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {formatCurrency(totalProfit, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-sm transition"
            >
              {t('sessionModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t('sessionModal.finishAndSaveBtn')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
