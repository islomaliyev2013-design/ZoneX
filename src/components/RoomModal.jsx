import React, { useState, useEffect } from 'react';
import { X, Tv, Sparkles, Plus, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_ZONE_PRESETS = [
  'Standart Zal',
  'VIP Kabina',
  'Game Zone',
  'Comfort Zone',
];

export default function RoomModal({ isOpen, onClose, mode = 'add', initialRoom = null }) {
  const { t } = useLanguage();
  const { settings, addRoom, updateRoom, rooms } = useApp();
  const currency = settings?.currency || "so'm";

  const nextDefaultNumber =
    rooms.length > 0 ? Math.max(...rooms.map((r) => Number(r.id) || 0)) + 1 : 1;

  const [name, setName] = useState('');
  const [zoneType, setZoneType] = useState('Standart Zal');
  const [hourlyRate, setHourlyRate] = useState('20000');
  const [isUnlimitedOnly, setIsUnlimitedOnly] = useState(false);
  const [stationCount, setStationCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialRoom) {
        setName(initialRoom.name || `${initialRoom.id}-xona`);
        setZoneType(initialRoom.zoneType || 'Standart Zal');
        setHourlyRate(String(initialRoom.hourlyRate || 20000));
        setIsUnlimitedOnly(Boolean(initialRoom.isUnlimitedOnly));
        setStationCount(initialRoom.stations?.length || 0);
      } else {
        setName(`${nextDefaultNumber}-xona`);
        setZoneType('Standart Zal');
        setHourlyRate('20000');
        setIsUnlimitedOnly(false);
        setStationCount(0); // Starts from 0 consoles by default as user requested!
      }
    }
  }, [isOpen, mode, initialRoom, nextDefaultNumber]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const rateNum = Math.max(1000, Number(hourlyRate) || 20000);

    if (mode === 'edit' && initialRoom) {
      updateRoom(initialRoom.id, {
        name: name.trim() || initialRoom.name,
        zoneType: zoneType.trim() || 'Standart Zal',
        hourlyRate: rateNum,
        isUnlimitedOnly,
      });
    } else {
      addRoom({
        name: name.trim() || `${nextDefaultNumber}-xona`,
        zoneType: zoneType.trim() || 'Standart Zal',
        hourlyRate: rateNum,
        isUnlimitedOnly,
        stationCount: Number(stationCount) || 0,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14]/92 backdrop-blur-md p-3 sm:p-5 overflow-hidden">
      <div className="bg-midnight-card rounded-2xl w-full max-w-lg text-white shadow-2xl border border-midnight-border flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header */}
        <div className="shrink-0 px-5 py-4 bg-midnight-sidebar text-white flex items-center justify-between border-b border-midnight-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {mode === 'edit' ? t('rooms.editRoomBtn') : t('rooms.addRoomBtn')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'edit'
                  ? initialRoom?.name
                  : t('rooms.noRoomsSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-hover transition"
            title={t('common.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          
          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              {t('rooms.roomNameLabel')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="masalan: 1-xona, VIP Zal, Cyber Lounge"
              className="w-full px-4 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
            />
          </div>

          {/* Zone Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              {t('rooms.zoneTypeLabel')}
            </label>
            <input
              type="text"
              value={zoneType}
              onChange={(e) => setZoneType(e.target.value)}
              placeholder="masalan: VIP Kabina, Standart Zal"
              className="w-full px-4 py-2 bg-midnight-bg border border-midnight-border rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple mb-2 transition"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_ZONE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setZoneType(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                    zoneType === preset
                      ? 'bg-brand-purple text-slate-950 border-brand-purple'
                      : 'bg-midnight-bg text-slate-300 border-midnight-border hover:border-slate-500'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              {t('rooms.hourlyRateLabel')} ({currency} / soat) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full pl-4 pr-24 py-2.5 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple transition"
              />
              <span className="absolute right-3.5 top-3 text-brand-lavender text-xs font-bold pointer-events-none">
                {currency}/soat
              </span>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[20000, 30000, 40000, 50000].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setHourlyRate(String(rate))}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                    hourlyRate === String(rate)
                      ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                      : 'bg-midnight-bg text-cyan-300 border-midnight-border hover:border-cyan-500/40'
                  }`}
                >
                  {formatCurrency(rate, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* Unlimited Only Toggle */}
          <div className="p-3 rounded-xl bg-midnight-bg border border-midnight-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                {t('rooms.isUnlimitedLabel')}
              </span>
              <span className="text-[11px] text-slate-400">
                Seanslar faqat ochiq vaqt rejimida boshlanadi
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isUnlimitedOnly}
                onChange={(e) => setIsUnlimitedOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {/* Initial Consoles Count (Only for mode === 'add') */}
          {mode === 'add' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                {t('rooms.initialStationsLabel')}
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStationCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                      stationCount === num
                        ? 'bg-brand-purple text-slate-950 border-brand-purple shadow-sm'
                        : 'bg-midnight-bg text-slate-300 border-midnight-border hover:border-slate-500'
                    }`}
                  >
                    {num === 0 ? '0 ta' : `${num} ta`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Konsollarni keyinchalik ham istalgan paytda «+ PlayStation qo‘shish» tugmasi orqali qo‘shishingiz mumkin.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-midnight-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-midnight-border text-slate-400 hover:text-white hover:bg-midnight-hover text-xs font-bold transition cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-cyan-500 hover:from-brand-purpleHover hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
            >
              {mode === 'edit' ? t('rooms.editRoomBtn') : t('rooms.addRoomBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
