import React, { useState } from 'react';
import { Play, X, User, Tv } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function StartSessionModal({ station, isOpen, onClose }) {
  const { settings, startSession } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || '$';

  const [hourlyPrice, setHourlyPrice] = useState(
    settings.defaultHourlyRate != null ? settings.defaultHourlyRate : 15
  );
  const [customerName, setCustomerName] = useState('');

  if (!isOpen || !station) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hourlyPrice || Number(hourlyPrice) <= 0) {
      alert(t('sessionModal.hourlyPriceRequired'));
      return;
    }
    startSession(station.id, {
      hourlyPrice: Number(hourlyPrice),
      customerName: customerName.trim(),
    });
    onClose();
  };

  const localizedRoomName = t('rooms.roomN', { n: station.roomId });
  const localizedStationName = `${t('common.stationPrefix')} ${station.stationNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md text-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {t('sessionModal.startTitle', {
                  room: localizedRoomName,
                  station: localizedStationName,
                })}
              </h3>
              <p className="text-xs text-slate-500">{t('sessionModal.startSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Hourly Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              {t('sessionModal.hourlyPrice')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm font-bold">
                {currency}
              </span>
              <input
                type="number"
                min="0.1"
                step="any"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value)}
                placeholder="15.00"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t('sessionModal.hourlyPriceRequired')}</p>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              {t('sessionModal.customerName')}{' '}
              <span className="text-slate-400 text-[10px] font-normal">
                {t('sessionModal.optional')}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('sessionModal.customerNamePlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition"
            >
              {t('sessionModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              {t('sessionModal.startSessionBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
