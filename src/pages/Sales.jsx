import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Receipt,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';

export default function Sales() {
  const {
    settings,
    transactions = [],
    productsCatalog = [],
    addProductToCatalog,
    deleteProductFromCatalog,
  } = useApp();
  const { t } = useLanguage();
  const currency = settings?.currency || "so'm";

  // New Catalog item state
  const [newCatName, setNewCatName] = useState('');
  const [newCatCost, setNewCatCost] = useState('');
  const [newCatSell, setNewCatSell] = useState('');
  const [catalogFeedback, setCatalogFeedback] = useState(null);

  const handleAddCatalogItem = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const added = addProductToCatalog({
      name: newCatName.trim(),
      purchasePrice: Number(newCatCost) || 0,
      sellingPrice: Number(newCatSell) || 0,
    });

    if (added) {
      setCatalogFeedback(t('catalog.addedSuccess'));
      setNewCatName('');
      setNewCatCost('');
      setNewCatSell('');
      setTimeout(() => setCatalogFeedback(null), 4000);
    }
  };

  const handleDeleteCatalogItem = (id, name) => {
    if (window.confirm(`${t('catalog.deleteConfirm')} (${name})`)) {
      deleteProductFromCatalog(id);
    }
  };

  // Recent product sales history from completed sessions & station orders
  const recentProductSales = transactions
    .filter((tx) => tx.products && tx.products.length > 0)
    .slice(0, 10);

  const potentialUnitProfit = Math.max(0, (Number(newCatSell) || 0) - (Number(newCatCost) || 0));

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('sales.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            {t('catalog.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1D1B2E] px-3.5 py-2 rounded-xl border border-[rgba(167,139,250,0.15)] text-xs font-bold text-[#A78BFA] shadow-xs">
          <Package className="w-4 h-4 text-[#A78BFA]" />
          <span>{productsCatalog.length} ta mahsulot mavjud</span>
        </div>
      </div>

      {catalogFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="text-sm font-bold">{catalogFeedback}</span>
        </div>
      )}

      {/* Add New Product Card */}
      <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)]">
        <div className="flex items-center gap-3 pb-4 border-b border-[rgba(167,139,250,0.15)]">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t('catalog.addNewTitle')}</h2>
            <p className="text-xs text-[#A1A1AA]">{t('catalog.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleAddCatalogItem} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                {t('catalog.name')} *
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={t('catalog.namePlaceholder')}
                className="w-full px-3.5 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                {t('catalog.cost')} ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={newCatCost}
                onChange={(e) => setNewCatCost(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                {t('catalog.sell')} ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={newCatSell}
                onChange={(e) => setNewCatSell(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] transition"
                required
              />
            </div>
          </div>

          {/* Profit preview & Submit button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#101014] p-3.5 rounded-xl border border-[rgba(167,139,250,0.15)]">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-[#A1A1AA] font-bold">{t('catalog.margin')}:</span>
              <span className="text-sm font-extrabold text-emerald-400">
                +{formatCurrency(potentialUnitProfit, currency)}
              </span>
              {Number(newCatSell) > 0 && (
                <span className="text-[11px] text-[#A78BFA] font-bold">
                  ({Math.round((potentialUnitProfit / Number(newCatSell)) * 100)}% marja)
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!newCatName.trim() || !newCatSell}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('catalog.addButton')}
            </button>
          </div>
        </form>
      </div>

      {/* List of Products in Catalog ("Mavjud mahsulotlar") */}
      <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)]">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(167,139,250,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('catalog.listTitle')}</h3>
              <p className="text-xs text-[#A1A1AA]">
                {t('catalog.totalItems', { count: productsCatalog.length })}
              </p>
            </div>
          </div>
        </div>

        {productsCatalog.length === 0 ? (
          <div className="text-center py-12 text-[#A1A1AA] text-sm">
            <Package className="w-12 h-12 mx-auto text-[#A1A1AA] mb-3 opacity-60" />
            <p className="font-bold text-white mb-1">{t('catalog.empty')}</p>
            <p className="text-xs text-[#A1A1AA]">Yuqoridagi forma orqali birinchi mahsulotni qo‘shing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {productsCatalog.map((item) => {
              const profit = Math.max(0, item.sellingPrice - item.purchasePrice);
              const marginPct =
                item.sellingPrice > 0 ? Math.round((profit / item.sellingPrice) * 100) : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#101014] border border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-extrabold text-base text-white">{item.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        +{marginPct}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#A1A1AA]">
                      <div className="flex justify-between">
                        <span>{t('catalog.cost')}:</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(item.purchasePrice, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('catalog.sell')}:</span>
                        <span className="font-bold text-[#A78BFA] text-sm">
                          {formatCurrency(item.sellingPrice, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[rgba(167,139,250,0.15)]">
                        <span>{t('catalog.margin')}:</span>
                        <span className="font-extrabold text-emerald-400">
                          +{formatCurrency(profit, currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-3 mt-3 border-t border-[rgba(167,139,250,0.15)]">
                    <button
                      type="button"
                      onClick={() => handleDeleteCatalogItem(item.id, item.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
                      title={t('common.delete') || 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('common.delete') || "O'chirish"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Product Sales History */}
      {recentProductSales.length > 0 && (
        <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)]">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#A78BFA]" />
            {t('sales.recentProductSales')}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101014]/60 text-[#A1A1AA] uppercase tracking-wider text-[10px] font-bold border-b border-[rgba(167,139,250,0.15)]">
                <tr>
                  <th className="py-2.5 px-3">{t('sales.dateTime')}</th>
                  <th className="py-2.5 px-3">{t('sales.destination')}</th>
                  <th className="py-2.5 px-3">{t('sales.itemsSold')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.revenue')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.cost')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.profit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(167,139,250,0.1)] text-white">
                {recentProductSales.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#25233B]/40 transition">
                    <td className="py-2.5 px-3 font-medium text-[#A1A1AA]">
                      {tx.dateStr} • {tx.timeStr}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-white">
                        {tx.roomName ? tx.roomName.replace(/^(\d+)-xona$/i, '$1-PlayStation') : ''}
                      </span>
                      {tx.stationName && tx.stationName !== '-' && (
                        <span className="text-[#A1A1AA]">
                          {' '}
                          (
                          {tx.stationName
                            .replace(/^Konsol\s*(\d+)$/i, '$1-xona')
                            .replace(/^Station\s*(\d+)$/i, '$1-xona')}
                          )
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">
                      {tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {formatCurrency(tx.productRevenue, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#A1A1AA]">
                      {formatCurrency(tx.productCost, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
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
