import React from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const QUICK_PRODUCTS = ['Semichka', 'Coca-Cola', 'Water', 'Snacks', 'Red Bull', 'Chips'];

export default function ProductInputTable({
  products = [],
  onChange,
  showQuickChips = true,
}) {
  const { settings } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || '$';

  const addRow = (prefillName = '') => {
    const newRow = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: prefillName,
      quantity: 1,
      purchasePrice: '',
      sellingPrice: '',
    };
    onChange([...products, newRow]);
  };

  const updateRow = (index, field, value) => {
    const updated = products.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: value,
        };
      }
      return item;
    });
    onChange(updated);
  };

  const removeRow = (index) => {
    onChange(products.filter((_, idx) => idx !== index));
  };

  // Compute live totals
  const totals = products.reduce(
    (acc, p) => {
      const q = Number(p.quantity) || 0;
      const buy = Number(p.purchasePrice) || 0;
      const sell = Number(p.sellingPrice) || 0;
      const rev = q * sell;
      const cost = q * buy;
      return {
        revenue: acc.revenue + rev,
        cost: acc.cost + cost,
        profit: acc.profit + (rev - cost),
        items: acc.items + q,
      };
    },
    { revenue: 0, cost: 0, profit: 0, items: 0 }
  );

  return (
    <div className="space-y-3">
      {/* Quick Suggestion Chips */}
      {showQuickChips && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" /> {t('productInput.quickAdd')}
          </span>
          {QUICK_PRODUCTS.map((prod) => (
            <button
              key={prod}
              type="button"
              onClick={() => addRow(prod)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200 transition font-medium"
            >
              + {prod}
            </button>
          ))}
        </div>
      )}

      {/* Product Rows */}
      {products.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-xs text-slate-500 mb-2">{t('productInput.noProductsYet')}</p>
          <button
            type="button"
            onClick={() => addRow()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('productInput.addFirstProduct')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="sm:col-span-4">{t('productInput.productName')}</div>
            <div className="sm:col-span-2 text-center">{t('productInput.quantity')}</div>
            <div className="sm:col-span-2">{t('productInput.purchasePrice', { currency })}</div>
            <div className="sm:col-span-2">{t('productInput.sellingPrice', { currency })}</div>
            <div className="sm:col-span-2 text-right">{t('productInput.profit')}</div>
          </div>

          {/* Rows */}
          {products.map((p, idx) => {
            const qty = Number(p.quantity) || 0;
            const buy = Number(p.purchasePrice) || 0;
            const sell = Number(p.sellingPrice) || 0;
            const lineRev = qty * sell;
            const lineCost = qty * buy;
            const lineProfit = lineRev - lineCost;

            return (
              <div
                key={p.id || idx}
                className="p-3 sm:p-2 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
              >
                {/* Product Name */}
                <div className="sm:col-span-4">
                  <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase">
                    {t('productInput.productName')}
                  </label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updateRow(idx, 'name', e.target.value)}
                    placeholder={t('productInput.productPlaceholder')}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase">
                    {t('productInput.quantity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={p.quantity}
                    onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                    placeholder="1"
                    className="w-full px-2 py-1.5 text-xs font-semibold text-center bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Purchase Price */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase">
                    {t('productInput.purchasePrice', { currency })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={p.purchasePrice}
                    onChange={(e) => updateRow(idx, 'purchasePrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Selling Price */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[10px] font-bold text-slate-500 uppercase">
                    {t('productInput.sellingPrice', { currency })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={p.sellingPrice}
                    onChange={(e) => updateRow(idx, 'sellingPrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Line Profit & Delete */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-medium">
                      {t('productInput.profit')}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        lineProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(lineProfit, currency)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title={t('productInput.removeItem')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Row Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => addRow()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('productInput.addAnotherProduct')}
            </button>
          </div>

          {/* Summary Box */}
          <div className="mt-3 p-3 bg-slate-100 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex gap-4">
              <div>
                <span className="text-slate-500 font-medium block">{t('productInput.totalCostLabel')}</span>
                <span className="font-bold text-slate-800">{formatCurrency(totals.cost, currency)}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">{t('productInput.totalRevenueLabel')}</span>
                <span className="font-bold text-blue-600">{formatCurrency(totals.revenue, currency)}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-right">{t('productInput.productProfitLabel')}</span>
              <span className="font-bold text-emerald-600 text-sm">{formatCurrency(totals.profit, currency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
