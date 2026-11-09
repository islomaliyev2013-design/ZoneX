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
  const { settings, productsCatalog = [] } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  const addRow = (prefillName = '', buy = '', sell = '') => {
    const newRow = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: prefillName,
      quantity: 1,
      purchasePrice: buy,
      sellingPrice: sell,
    };
    onChange([...products, newRow]);
  };

  const addRowFromCatalog = (catItem) => {
    // If the last row is completely empty, replace it
    const lastIdx = products.length - 1;
    if (
      lastIdx >= 0 &&
      !products[lastIdx].name &&
      !products[lastIdx].purchasePrice &&
      !products[lastIdx].sellingPrice
    ) {
      const updated = [...products];
      updated[lastIdx] = {
        ...products[lastIdx],
        name: catItem.name,
        quantity: 1,
        purchasePrice: catItem.purchasePrice,
        sellingPrice: catItem.sellingPrice,
      };
      onChange(updated);
      return;
    }

    addRow(catItem.name, catItem.purchasePrice, catItem.sellingPrice);
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
      {/* Quick Suggestion Chips from Admin's Catalog ("Nimalar bor") */}
      {showQuickChips && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-purpleLight" /> {t('productInput.quickAdd')}
          </span>
          {productsCatalog && productsCatalog.length > 0 ? (
            productsCatalog.map((prod) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => addRowFromCatalog(prod)}
                title={`${prod.name} (Tannarxi: ${formatCurrency(prod.purchasePrice, currency)}, Sotilishi: ${formatCurrency(prod.sellingPrice, currency)})`}
                className="text-xs px-2.5 py-1 rounded-lg bg-midnight-bg hover:bg-brand-purple/20 hover:text-brand-purpleLight text-slate-300 border border-midnight-border transition font-medium flex items-center gap-1"
              >
                <span>+ {prod.name}</span>
                {prod.sellingPrice > 0 && (
                  <span className="text-[10px] text-brand-lavender/80 font-bold">
                    ({formatCurrency(prod.sellingPrice, currency)})
                  </span>
                )}
              </button>
            ))
          ) : (
            QUICK_PRODUCTS.map((prod) => (
              <button
                key={prod}
                type="button"
                onClick={() => addRow(prod)}
                className="text-xs px-2.5 py-1 rounded-lg bg-midnight-bg hover:bg-brand-purple/20 hover:text-brand-purpleLight text-slate-300 border border-midnight-border transition font-medium"
              >
                + {prod}
              </button>
            ))
          )}
        </div>
      )}

      {/* Product Rows */}
      {products.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-midnight-border rounded-xl bg-midnight-bg/40">
          <p className="text-xs text-slate-400 mb-2">{t('productInput.noProductsYet')}</p>
          <button
            type="button"
            onClick={() => addRow()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 hover:bg-brand-purple hover:text-white text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('productInput.addFirstProduct')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                className="p-3 sm:p-2 bg-midnight-bg rounded-xl border border-midnight-border grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
              >
                {/* Product Name */}
                <div className="sm:col-span-4">
                  <label className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">
                    {t('productInput.productName')}
                  </label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updateRow(idx, 'name', e.target.value)}
                    placeholder={t('productInput.productPlaceholder')}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-midnight-card border border-midnight-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">
                    {t('productInput.quantity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={p.quantity}
                    onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                    placeholder="1"
                    className="w-full px-2 py-1.5 text-xs font-semibold text-center bg-midnight-card border border-midnight-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    required
                  />
                </div>

                {/* Purchase Price */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">
                    {t('productInput.purchasePrice', { currency })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={p.purchasePrice}
                    onChange={(e) => updateRow(idx, 'purchasePrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2 py-1.5 text-xs font-semibold bg-midnight-card border border-midnight-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    required
                  />
                </div>

                {/* Selling Price */}
                <div className="sm:col-span-2">
                  <label className="sm:hidden text-[10px] font-bold text-slate-400 uppercase">
                    {t('productInput.sellingPrice', { currency })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={p.sellingPrice}
                    onChange={(e) => updateRow(idx, 'sellingPrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2 py-1.5 text-xs font-semibold bg-midnight-card border border-midnight-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    required
                  />
                </div>

                {/* Line Profit & Delete */}
                <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-midnight-border">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-medium">
                      {t('productInput.profit')}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        lineProfit >= 0 ? 'text-gaming-green' : 'text-gaming-red'
                      }`}
                    >
                      {formatCurrency(lineProfit, currency)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-gaming-red hover:bg-gaming-redBg rounded-lg transition"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-purpleLight hover:text-white bg-brand-purple/15 hover:bg-brand-purple/30 border border-brand-purple/30 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('productInput.addAnotherProduct')}
            </button>
          </div>

          {/* Summary Box */}
          <div className="mt-3 p-3 bg-midnight-bg rounded-xl border border-midnight-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex gap-4">
              <div>
                <span className="text-slate-400 font-medium block">{t('productInput.totalCostLabel')}</span>
                <span className="font-bold text-white">{formatCurrency(totals.cost, currency)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">{t('productInput.totalRevenueLabel')}</span>
                <span className="font-bold text-brand-lavender">{formatCurrency(totals.revenue, currency)}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-right">{t('productInput.productProfitLabel')}</span>
              <span className="font-bold text-gaming-green text-sm">{formatCurrency(totals.profit, currency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
