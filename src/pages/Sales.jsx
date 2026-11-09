import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Receipt,
  User,
  Tv,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import { calculateProductTotals } from '../utils/calculations';
import ProductInputTable from '../components/ProductInputTable';

export default function Sales() {
  const { rooms, recordDirectSale, settings, transactions } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || '$';

  const [customerName, setCustomerName] = useState('');
  const [selectedStationTarget, setSelectedStationTarget] = useState('direct');
  const [products, setProducts] = useState([
    {
      id: `p_${Date.now()}`,
      name: '',
      quantity: 1,
      purchasePrice: '',
      sellingPrice: '',
    },
  ]);
  const [successMessage, setSuccessMessage] = useState(null);

  // Compute live totals
  const validProducts = products.filter(
    (p) => p.name && p.name.trim() !== '' && Number(p.quantity) > 0
  );
  const totals = calculateProductTotals(validProducts);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validProducts.length === 0) {
      alert(t('productInput.noProductsYet'));
      return;
    }

    let roomInfo = null;
    if (selectedStationTarget !== 'direct') {
      const [rId, sId] = selectedStationTarget.split('-');
      const roomNum = parseInt(rId.replace('r', ''), 10);
      const stationNum = parseInt(sId.replace('s', ''), 10);
      roomInfo = {
        roomId: roomNum,
        roomName: t('rooms.roomN', { n: roomNum }),
        stationNumber: stationNum,
        stationName: `${t('common.stationPrefix')} ${stationNum}`,
      };
    }

    const cleanedProducts = validProducts.map((p) => {
      const q = Number(p.quantity) || 1;
      const buy = Number(p.purchasePrice) || 0;
      const sell = Number(p.sellingPrice) || 0;
      return {
        name: p.name.trim(),
        quantity: q,
        purchasePrice: buy,
        sellingPrice: sell,
        totalCost: q * buy,
        totalRevenue: q * sell,
        profit: q * sell - q * buy,
      };
    });

    const tx = recordDirectSale({
      customerName: customerName.trim(),
      products: cleanedProducts,
      roomInfo,
    });

    if (tx) {
      setSuccessMessage(
        t('sales.saleRecordedSuccess', {
          total: formatCurrency(totals.totalRevenue, currency),
          profit: formatCurrency(totals.totalProfit, currency),
        })
      );
      // Reset form
      setProducts([
        {
          id: `p_${Date.now()}`,
          name: '',
          quantity: 1,
          purchasePrice: '',
          sellingPrice: '',
        },
      ]);
      setCustomerName('');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Recent product transactions for today
  const recentProductSales = transactions
    .filter((tx) => tx.products && tx.products.length > 0)
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('sales.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t('sales.subtitle')}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}

      {/* Main Sales Entry Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('sales.newSaleTitle')}</h2>
              <p className="text-xs text-slate-500">
                {t('sales.enterManuallyHint')}
              </p>
            </div>
          </div>

          {/* Optional context: Customer Name & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                {t('sales.customerName')}{' '}
                <span className="text-slate-400 font-normal">{t('sessionModal.optional')}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex, Jasur"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                {t('sales.saleDestination')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Tv className="w-4 h-4" />
                </span>
                <select
                  value={selectedStationTarget}
                  onChange={(e) => setSelectedStationTarget(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="direct">{t('sales.counterDirectSale')}</option>
                  {rooms.map((r) => (
                    <optgroup key={r.id} label={t('rooms.roomN', { n: r.id })}>
                      {r.stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {t('rooms.roomN', { n: r.id })} — {t('common.stationPrefix')} {s.stationNumber}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Manual Table */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              {t('sales.productsSold')}
            </label>
            <ProductInputTable
              products={products}
              onChange={setProducts}
              showQuickChips={true}
            />
          </div>

          {/* Totals & Submit */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block uppercase">{t('sales.totalCost')}</span>
                <span className="font-bold text-slate-200">{formatCurrency(totals.totalCost, currency)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase">{t('sales.totalRevenue')}</span>
                <span className="font-bold text-blue-400 text-lg">{formatCurrency(totals.totalRevenue, currency)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block uppercase">{t('sales.netProfit')}</span>
                <span className="font-extrabold text-emerald-400 text-lg">{formatCurrency(totals.totalProfit, currency)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={validProducts.length === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t('sales.recordSaleBtn')}
            </button>
          </div>

        </form>
      </div>

      {/* Recent Product Sales History */}
      {recentProductSales.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            {t('sales.recentProductSales')}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{t('sales.dateTime')}</th>
                  <th className="py-2.5 px-3">{t('sales.destination')}</th>
                  <th className="py-2.5 px-3">{t('sales.itemsSold')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.revenue')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.cost')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.profit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentProductSales.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium">
                      {tx.dateStr} • {tx.timeStr}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900">{tx.roomName}</span>
                      {tx.stationName && tx.stationName !== '-' && (
                        <span className="text-slate-400"> ({tx.stationName})</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(tx.productRevenue, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {formatCurrency(tx.productCost, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600">
                      {formatCurrency(tx.productProfit, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
