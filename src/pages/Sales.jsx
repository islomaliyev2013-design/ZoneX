import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Receipt,
  User,
  Tv,
  Package,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import { calculateProductTotals } from '../utils/calculations';
import ProductInputTable from '../components/ProductInputTable';

export default function Sales() {
  const {
    rooms,
    recordDirectSale,
    settings,
    transactions,
    productsCatalog = [],
    addProductToCatalog,
    deleteProductFromCatalog,
  } = useApp();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const currency = settings.currency || "so'm";

  // Navigation tab: 'sales' | 'catalog' (catalog only accessible by admin)
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    if (!isAdmin && activeTab !== 'sales') {
      setActiveTab('sales');
    }
  }, [isAdmin, activeTab]);

  // Sales form state
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

  // New Catalog item state
  const [newCatName, setNewCatName] = useState('');
  const [newCatCost, setNewCatCost] = useState('');
  const [newCatSell, setNewCatSell] = useState('');
  const [catalogFeedback, setCatalogFeedback] = useState(null);

  // Compute live totals for sales form
  const validProducts = products.filter(
    (p) => p.name && p.name.trim() !== '' && Number(p.quantity) > 0
  );
  const totals = calculateProductTotals(validProducts);

  const handleSubmitSale = (e) => {
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

  const handleSellCatalogItem = (item) => {
    // Switch to sales tab and add this item
    setActiveTab('sales');
    const newRow = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      quantity: 1,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
    };

    // If only one empty row exists, replace it
    if (
      products.length === 1 &&
      !products[0].name &&
      !products[0].purchasePrice &&
      !products[0].sellingPrice
    ) {
      setProducts([newRow]);
    } else {
      setProducts((prev) => [...prev, newRow]);
    }
  };

  // Recent product sales history
  const recentProductSales = transactions
    .filter((tx) => tx.products && tx.products.length > 0)
    .slice(0, 5);

  const potentialUnitProfit = Math.max(0, (Number(newCatSell) || 0) - (Number(newCatCost) || 0));

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('sales.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('sales.subtitle')}
          </p>
        </div>

        {/* Tab switcher: Savdo qilish vs Nimalar bor & Qo'shish (Faqat Admin uchun) */}
        {isAdmin && (
          <div className="flex items-center bg-midnight-card p-1 rounded-xl border border-midnight-border">
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'sales'
                  ? 'bg-brand-purple text-slate-950 font-black shadow-md shadow-brand-purple/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('catalog.tabSales')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'catalog'
                  ? 'bg-brand-purple text-slate-950 font-black shadow-md shadow-brand-purple/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t('catalog.tabCatalog')}</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-brand-purpleDark text-brand-lavender font-extrabold">
                {productsCatalog.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-gaming-greenBg border border-gaming-green/30 text-gaming-green flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}

      {catalogFeedback && (
        <div className="p-4 rounded-xl bg-gaming-greenBg border border-gaming-green/30 text-gaming-green flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{catalogFeedback}</span>
        </div>
      )}

      {/* TAB 1: PRODUCT SALES FORM */}
      {activeTab === 'sales' && (
        <>
          <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border">
            <form onSubmit={handleSubmitSale} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-midnight-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t('sales.newSaleTitle')}</h2>
                    <p className="text-xs text-slate-400">
                      {t('sales.enterManuallyHint')}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-purpleLight hover:text-white transition"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>{t('catalog.addNewTitle')} →</span>
                  </button>
                )}
              </div>

              {/* Customer Name & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('sales.saleDestination')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400">
                      <Tv className="w-4 h-4" />
                    </span>
                    <select
                      value={selectedStationTarget}
                      onChange={(e) => setSelectedStationTarget(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
                    >
                      <option value="direct">{t('sales.counterDirectSale')}</option>
                      {rooms.map((r) => (
                        <optgroup key={r.id} label={t('rooms.roomN', { n: r.id })}>
                          {r.stations.map((s) => (
                            <option key={s.id} value={s.id}>
                              {t('rooms.roomN', { n: r.id })} — {t('common.stationPrefix')} {s.stationNumber} {s.status === 'occupied' ? '🔴' : '🟢'}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Table with Quick Catalog Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
                  {t('sales.productsSold')}
                </label>
                <ProductInputTable
                  products={products}
                  onChange={setProducts}
                  showQuickChips={true}
                />
              </div>

              {/* Totals & Submit */}
              <div className="p-4 rounded-xl bg-midnight-bg border border-midnight-border text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">{t('sales.totalCost')}</span>
                    <span className="font-bold text-white text-base">{formatCurrency(totals.totalCost, currency)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">{t('sales.totalRevenue')}</span>
                    <span className="font-bold text-brand-lavender text-lg">{formatCurrency(totals.totalRevenue, currency)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">{t('sales.netProfit')}</span>
                    <span className="font-black text-gaming-green text-lg">{formatCurrency(totals.totalProfit, currency)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={validProducts.length === 0}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-purple hover:bg-brand-purpleHover disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-lg shadow-brand-purple/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {t('sales.recordSaleBtn')}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Product Sales History */}
          {recentProductSales.length > 0 && (
            <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-purpleLight" />
                {t('sales.recentProductSales')}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-midnight-bg text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-midnight-border">
                    <tr>
                      <th className="py-2.5 px-3">{t('sales.dateTime')}</th>
                      <th className="py-2.5 px-3">{t('sales.destination')}</th>
                      <th className="py-2.5 px-3">{t('sales.itemsSold')}</th>
                      <th className="py-2.5 px-3 text-right">{t('sales.revenue')}</th>
                      <th className="py-2.5 px-3 text-right">{t('sales.cost')}</th>
                      <th className="py-2.5 px-3 text-right">{t('sales.profit')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-midnight-border text-slate-300">
                    {recentProductSales.map((tx) => (
                      <tr key={tx.id} className="hover:bg-midnight-bg/60 transition">
                        <td className="py-2.5 px-3 font-medium text-white">
                          {tx.dateStr} • {tx.timeStr}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-white">{tx.roomName}</span>
                          {tx.stationName && tx.stationName !== '-' && (
                            <span className="text-slate-400"> ({tx.stationName})</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          {formatCurrency(tx.productRevenue, currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {formatCurrency(tx.productCost, currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-gaming-green">
                          {formatCurrency(tx.productProfit, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: INVENTORY & CATALOG ("NIMALAR BOR & YANGI QO'SHISH") - Faqat Admin uchun */}
      {isAdmin && activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Add New Product Card */}
          <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border">
            <div className="flex items-center gap-3 pb-4 border-b border-midnight-border">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t('catalog.addNewTitle')}</h2>
                <p className="text-xs text-slate-400">{t('catalog.subtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleAddCatalogItem} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('catalog.name')} *
                  </label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder={t('catalog.namePlaceholder')}
                    className="w-full px-3.5 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('catalog.cost')} ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newCatCost}
                    onChange={(e) => setNewCatCost(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('catalog.sell')} ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newCatSell}
                    onChange={(e) => setNewCatSell(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
                    required
                  />
                </div>
              </div>

              {/* Profit preview & Submit button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-midnight-bg/60 p-3.5 rounded-xl border border-midnight-border">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400 font-bold">{t('catalog.margin')}:</span>
                  <span className="text-sm font-extrabold text-gaming-green">
                    +{formatCurrency(potentialUnitProfit, currency)}
                  </span>
                  {Number(newCatSell) > 0 && (
                    <span className="text-[11px] text-brand-lavender font-semibold">
                      ({Math.round((potentialUnitProfit / Number(newCatSell)) * 100)}% marja)
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!newCatName.trim() || !newCatSell}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleHover disabled:opacity-50 text-slate-950 font-black text-xs shadow-md shadow-brand-purple/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {t('catalog.addButton')}
                </button>
              </div>
            </form>
          </div>

          {/* List of Products in Catalog ("Nimalar bor") */}
          <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border">
            <div className="flex items-center justify-between pb-4 border-b border-midnight-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('catalog.listTitle')}</h3>
                  <p className="text-xs text-slate-400">
                    {t('catalog.totalItems', { count: productsCatalog.length })}
                  </p>
                </div>
              </div>
            </div>

            {productsCatalog.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <Package className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p>{t('catalog.empty')}</p>
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
                      className="p-4 rounded-xl bg-midnight-bg border border-midnight-border hover:border-brand-purple/40 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-extrabold text-base text-white">{item.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gaming-greenBg text-gaming-green border border-gaming-green/30">
                            +{marginPct}%
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>{t('catalog.cost')}:</span>
                            <span className="font-semibold text-slate-300">
                              {formatCurrency(item.purchasePrice, currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('catalog.sell')}:</span>
                            <span className="font-bold text-brand-lavender text-sm">
                              {formatCurrency(item.sellingPrice, currency)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-midnight-border/60">
                            <span>{t('catalog.margin')}:</span>
                            <span className="font-extrabold text-gaming-green">
                              +{formatCurrency(profit, currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 mt-3 border-t border-midnight-border/80">
                        <button
                          type="button"
                          onClick={() => handleSellCatalogItem(item)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-brand-purple/20 hover:bg-brand-purple text-brand-purpleLight hover:text-white border border-brand-purple/40 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('catalog.sellThis')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCatalogItem(item.id, item.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-gaming-red hover:bg-gaming-redBg/40 border border-transparent hover:border-gaming-red/30 transition"
                          title={t('common.delete') || 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
