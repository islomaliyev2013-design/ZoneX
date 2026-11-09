import React, { useState, useEffect } from 'react';
import { Play, X, User, Tv } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function StartSessionModal({ station, isOpen, onClose }) {
  const { settings, startSession } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  const [hourlyPrice, setHourlyPrice] = useState(
    settings.defaultHourlyRate != null ? settings.defaultHourlyRate : 20000
  );
  const [customerName, setCustomerName] = useState('');

  // Always reset hourlyPrice and customerName when a new station/room modal opens
  useEffect(() => {
    if (isOpen && station) {
      const defaultRate =
        station.hourlyRate != null
          ? station.hourlyRate
          : settings.defaultHourlyRate != null
          ? settings.defaultHourlyRate
          : 20000;
      setHourlyPrice(defaultRate);
      setCustomerName('');
    }
  }, [isOpen, station?.id, settings.defaultHourlyRate]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-midnight-card rounded-2xl p-6 w-full max-w-md text-white shadow-2xl border border-midnight-border animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-midnight-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {t('sessionModal.startTitle', {
                  room: localizedRoomName,
                  station: localizedStationName,
                })}
              </h3>
              <p className="text-xs text-slate-400">{t('sessionModal.startSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Hourly Price */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              {t('sessionModal.hourlyPrice')} <span className="text-gaming-red">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value)}
                placeholder="20000"
                className="w-full pl-4 pr-32 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-base font-bold text-white focus:bg-midnight-bg focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
                autoFocus
                required
              />
              <span className="absolute right-3.5 top-3 text-brand-lavender text-xs font-bold pointer-events-none">
                {currency} / soat
              </span>
            </div>
            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) + 1000))}
                className="px-2.5 py-1 rounded-lg bg-midnight-card hover:bg-brand-purple/20 text-brand-purpleLight border border-midnight-border hover:border-brand-purple/40 text-xs font-bold transition active:scale-95"
              >
                +1 000 so'm
              </button>
              <button
                type="button"
                onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) + 5000))}
                className="px-2.5 py-1 rounded-lg bg-midnight-card hover:bg-brand-purple/20 text-brand-purpleLight border border-midnight-border hover:border-brand-purple/40 text-xs font-bold transition active:scale-95"
              >
                +5 000 so'm
              </button>
              <button
                type="button"
                onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) + 10000))}
                className="px-2.5 py-1 rounded-lg bg-midnight-card hover:bg-brand-purple/20 text-brand-purpleLight border border-midnight-border hover:border-brand-purple/40 text-xs font-bold transition active:scale-95"
              >
                +10 000 so'm
              </button>
              <button
                type="button"
                onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) - 1000))}
                className="px-2.5 py-1 rounded-lg bg-midnight-card hover:bg-gaming-redBg text-slate-400 hover:text-gaming-red border border-midnight-border hover:border-gaming-red/40 text-xs font-bold transition active:scale-95"
              >
                -1 000 so'm
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t('sessionModal.hourlyPriceRequired')}</p>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-medium text-white focus:bg-midnight-bg focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-midnight-border text-slate-300 hover:bg-midnight-hover font-semibold text-sm transition"
            >
              {t('sessionModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-white font-bold text-sm shadow-md shadow-brand-purple/30 flex items-center justify-center gap-2 transition"
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
