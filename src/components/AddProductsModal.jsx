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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14]/92 backdrop-blur-md p-3 sm:p-5 overflow-hidden">
      <div className="bg-midnight-card rounded-2xl w-full max-w-xl text-white shadow-2xl border border-midnight-border flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header */}
        <div className="shrink-0 px-5 py-3.5 bg-midnight-sidebar text-white flex items-center justify-between border-b border-midnight-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {t('sessionModal.addProductsTitle', { station: localizedStationName })}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('sessionModal.addProductsSubtitle', {
                  room: localizedRoomName,
                  customer: station.session.customerName || t('common.walkIn'),
                })}
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

        {/* Form Container */}
        <form onSubmit={handleAdd} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
            <ProductInputTable
              products={newProducts}
              onChange={setNewProducts}
              showQuickChips={true}
            />
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 px-5 py-3.5 bg-midnight-sidebar/95 border-t border-midnight-border flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-midnight-border text-slate-300 hover:bg-midnight-hover font-bold text-sm transition"
            >
              {t('sessionModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-slate-950 font-black text-sm shadow-md shadow-brand-purple/30 flex items-center justify-center gap-2 transition cursor-pointer"
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
