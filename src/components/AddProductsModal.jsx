import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const rawRoomName = station.roomName || `${station.roomId}-PlayStation`;
  const localizedRoomName = rawRoomName
    .replace(/^(\d+)-xona$/i, '$1-PlayStation')
    .replace(/^Room\s*(\d+)$/i, 'PlayStation $1');

  const rawStationName = station.stationName || `${station.stationNumber}-xona`;
  const localizedStationName = rawStationName
    .replace(/^Konsol\s*(\d+)$/i, '$1-xona')
    .replace(/^Station\s*(\d+)$/i, '$1-xona');

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-5 overflow-hidden">
      <div className="bg-[#1D1B2E] rounded-2xl w-full max-w-xl text-white shadow-2xl border border-[rgba(167,139,250,0.15)] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header */}
        <div className="shrink-0 px-5 py-3.5 bg-[#1D1B2E] text-white flex items-center justify-between border-b border-[rgba(167,139,250,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                {t('sessionModal.addProductsTitle', { station: localizedStationName })}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {t('sessionModal.addProductsSubtitle', {
                  room: localizedRoomName,
                  customer: station.session.customerName || t('common.walkIn'),
                })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#25233B] transition cursor-pointer"
            title={t('common.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAdd} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <ProductInputTable
              products={newProducts}
              onChange={setNewProducts}
              showQuickChips={true}
            />
          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 px-5 py-3.5 bg-[#1D1B2E] border-t border-[rgba(167,139,250,0.15)] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:bg-[#25233B] hover:text-white font-bold text-sm transition cursor-pointer"
            >
              {t('sessionModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {t('sessionModal.addToSessionBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
