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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight">
            {t('sales.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            {t('catalog.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#E7E5E4] text-xs font-bold text-[#0D9488] shadow-xs">
          <Package className="w-4 h-4 text-[#0D9488]" />
          <span>{productsCatalog.length} ta mahsulot mavjud</span>
        </div>
      </div>

      {catalogFeedback && (
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-green-200 text-[#16A34A] flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#16A34A]" />
          <span className="text-sm font-bold">{catalogFeedback}</span>
        </div>
      )}

      {/* Add New Product Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4]">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E7E5E4]">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#292524]">{t('catalog.addNewTitle')}</h2>
            <p className="text-xs text-[#78716C]">{t('catalog.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleAddCatalogItem} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wide mb-1.5">
                {t('catalog.name')} *
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={t('catalog.namePlaceholder')}
                className="w-full px-3.5 py-2.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-sm font-semibold text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wide mb-1.5">
                {t('catalog.cost')} ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={newCatCost}
                onChange={(e) => setNewCatCost(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-sm font-semibold text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wide mb-1.5">
                {t('catalog.sell')} ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={newCatSell}
                onChange={(e) => setNewCatSell(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-sm font-semibold text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition"
                required
              />
            </div>
          </div>

          {/* Profit preview & Submit button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F5F5F4] p-3.5 rounded-xl border border-[#E7E5E4]">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-[#78716C] font-bold">{t('catalog.margin')}:</span>
              <span className="text-sm font-extrabold text-[#16A34A]">
                +{formatCurrency(potentialUnitProfit, currency)}
              </span>
              {Number(newCatSell) > 0 && (
                <span className="text-[11px] text-[#0D9488] font-bold">
                  ({Math.round((potentialUnitProfit / Number(newCatSell)) * 100)}% marja)
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!newCatName.trim() || !newCatSell}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('catalog.addButton')}
            </button>
          </div>
        </form>
      </div>

      {/* List of Products in Catalog ("Mavjud mahsulotlar") */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#292524]">{t('catalog.listTitle')}</h3>
              <p className="text-xs text-[#78716C]">
                {t('catalog.totalItems', { count: productsCatalog.length })}
              </p>
            </div>
          </div>
        </div>

        {productsCatalog.length === 0 ? (
          <div className="text-center py-12 text-[#78716C] text-sm">
            <Package className="w-12 h-12 mx-auto text-[#A8A29E] mb-3 opacity-60" />
            <p className="font-bold text-[#292524] mb-1">{t('catalog.empty')}</p>
            <p className="text-xs text-[#78716C]">Yuqoridagi forma orqali birinchi mahsulotni qo‘shing.</p>
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
                  className="p-4 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#0D9488]/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-extrabold text-base text-[#292524]">{item.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F0FDF4] text-[#16A34A] border border-green-200">
                        +{marginPct}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#78716C]">
                      <div className="flex justify-between">
                        <span>{t('catalog.cost')}:</span>
                        <span className="font-semibold text-[#292524]">
                          {formatCurrency(item.purchasePrice, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('catalog.sell')}:</span>
                        <span className="font-bold text-[#0D9488] text-sm">
                          {formatCurrency(item.sellingPrice, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#E7E5E4]">
                        <span>{t('catalog.margin')}:</span>
                        <span className="font-extrabold text-[#16A34A]">
                          +{formatCurrency(profit, currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-3 mt-3 border-t border-[#E7E5E4]">
                    <button
                      type="button"
                      onClick={() => handleDeleteCatalogItem(item.id, item.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#78716C] hover:text-[#DC2626] hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer"
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4]">
          <h3 className="text-base font-bold text-[#292524] mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0D9488]" />
            {t('sales.recentProductSales')}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F4] text-[#78716C] uppercase tracking-wider text-[10px] font-bold border-b border-[#E7E5E4]">
                <tr>
                  <th className="py-2.5 px-3">{t('sales.dateTime')}</th>
                  <th className="py-2.5 px-3">{t('sales.destination')}</th>
                  <th className="py-2.5 px-3">{t('sales.itemsSold')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.revenue')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.cost')}</th>
                  <th className="py-2.5 px-3 text-right">{t('sales.profit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4] text-[#292524]">
                {recentProductSales.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F5F5F4]/60 transition">
                    <td className="py-2.5 px-3 font-medium text-[#78716C]">
                      {tx.dateStr} • {tx.timeStr}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#292524]">
                        {tx.roomName ? tx.roomName.replace(/^(\d+)-xona$/i, '$1-PlayStation') : ''}
                      </span>
                      {tx.stationName && tx.stationName !== '-' && (
                        <span className="text-[#78716C]">
                          {' '}
                          (
                          {tx.stationName
                            .replace(/^Konsol\s*(\d+)$/i, '$1-xona')
                            .replace(/^Station\s*(\d+)$/i, '$1-xona')}
                          )
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      {tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#292524]">
                      {formatCurrency(tx.productRevenue, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#78716C]">
                      {formatCurrency(tx.productCost, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-[#16A34A]">
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
