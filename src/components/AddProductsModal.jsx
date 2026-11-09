import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import ProductInputTable from './ProductInputTable';

export default function AddProductsModal({ station, isOpen, onClose }) {
  const { addProductsToSession } = useApp();
  const { t } = useLanguage();

  const [newProducts, setNewProducts] = useState([
    {
      id: `p_init_${Date.now()}`,
      name: '',
      quantity: 1,
      purchasePrice: '',
      sellingPrice: '',
    },
  ]);

  // Reset product rows whenever modal opens for a station
  useEffect(() => {
    if (isOpen && station) {
      setNewProducts([
        {
          id: `p_init_${Date.now()}`,
          name: '',
          quantity: 1,
          purchasePrice: '',
          sellingPrice: '',
        },
      ]);
    }
  }, [isOpen, station?.id]);

  if (!isOpen || !station || !station.session) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    const valid = newProducts.filter(
      (p) => p.name && p.name.trim() !== '' && Number(p.quantity) > 0
    );

    if (valid.length === 0) {
      alert(t('productInput.noProductsYet'));
      return;
    }

    addProductsToSession(station.id, valid);
    onClose();
  };

  const localizedRoomName = t('rooms.roomN', { n: station.roomId });
  const localizedStationName = `${t('common.stationPrefix')} ${station.stationNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-midnight-card rounded-2xl p-6 w-full max-w-xl text-white shadow-2xl border border-midnight-border animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-midnight-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {t('sessionModal.addProductsTitle', { station: localizedStationName })}
              </h3>
              <p className="text-xs text-slate-400">
                {t('sessionModal.addProductsSubtitle', {
                  room: localizedRoomName,
                  customer: station.session.customerName || t('common.walkIn'),
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="mt-4 space-y-4">
          <ProductInputTable
            products={newProducts}
            onChange={setNewProducts}
            showQuickChips={true}
          />

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-midnight-border text-slate-300 hover:bg-midnight-hover font-bold text-sm transition"
            >
              {t('sessionModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-white font-bold text-sm shadow-md shadow-brand-purple/30 flex items-center justify-center gap-2 transition"
            >
              <Check className="w-4 h-4" />
              {t('sessionModal.addToSessionBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
