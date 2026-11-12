import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tv, Sparkles, Plus, Check, Trash2 } from 'lucide-react';
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
  const { settings, addRoom, updateRoom, deleteRoom, rooms } = useApp();
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
        setName(initialRoom.name || `${initialRoom.id}-PlayStation`);
        setZoneType(initialRoom.zoneType || 'Standart Zal');
        setHourlyRate(String(initialRoom.hourlyRate || 20000));
        setIsUnlimitedOnly(Boolean(initialRoom.isUnlimitedOnly));
        setStationCount(initialRoom.stations?.length || 0);
      } else {
        setName(`${nextDefaultNumber}-PlayStation`);
        setZoneType('Standart Zal');
        setHourlyRate('20000');
        setIsUnlimitedOnly(false);
        setStationCount(0); // Starts from 0 stations by default
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
        name: name.trim() || `${nextDefaultNumber}-PlayStation`,
        zoneType: zoneType.trim() || 'Standart Zal',
        hourlyRate: rateNum,
        isUnlimitedOnly,
        stationCount: Number(stationCount) || 0,
      });
    }

    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-5 overflow-hidden">
      <div className="bg-[#1D1B2E] rounded-2xl w-full max-w-lg text-white shadow-2xl border border-[rgba(167,139,250,0.15)] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header */}
        <div className="shrink-0 px-5 py-4 bg-[#1D1B2E] text-white flex items-center justify-between border-b border-[rgba(167,139,250,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                {mode === 'edit' ? t('rooms.editRoomBtn') : t('rooms.addRoomBtn')}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {mode === 'edit'
                  ? initialRoom?.name
                  : t('rooms.noRoomsSubtitle')}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          
          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
              {t('rooms.roomNameLabel')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="masalan: 1-PlayStation, VIP Kabina, Cyber Lounge"
              className="w-full px-4 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] transition"
            />
          </div>

          {/* Zone Type */}
          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
              {t('rooms.zoneTypeLabel')}
            </label>
            <input
              type="text"
              value={zoneType}
              onChange={(e) => setZoneType(e.target.value)}
              placeholder="masalan: VIP Kabina, Standart Zal"
              className="w-full px-4 py-2 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] mb-2 transition"
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
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                      : 'bg-[#101014] text-[#A1A1AA] border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
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
                className="w-full pl-4 pr-24 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED] transition"
              />
              <span className="absolute right-3.5 top-3 text-[#A1A1AA] text-xs font-bold pointer-events-none">
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
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                      : 'bg-[#101014] text-[#A78BFA] border-[rgba(167,139,250,0.2)] hover:border-[#7C3AED]/40'
                  }`}
                >
                  {formatCurrency(rate, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* Unlimited Only Toggle */}
          <div className="p-3 rounded-xl bg-[#101014] border border-[rgba(167,139,250,0.15)] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                {t('rooms.isUnlimitedLabel')}
              </span>
              <span className="text-[11px] text-[#A1A1AA]">
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
              <div className="w-11 h-6 bg-[#25233B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#101014] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C3AED]"></div>
            </label>
          </div>

          {/* Initial Consoles Count (Only for mode === 'add') */}
          {mode === 'add' && (
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                {t('rooms.initialStationsLabel')}
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStationCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      stationCount === num
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.4)]'
                        : 'bg-[#101014] text-[#A1A1AA] border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 hover:text-white'
                    }`}
                  >
                    {num === 0 ? '0 ta' : `${num} ta xona`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-1.5">
                Xonalarni keyinchalik ham istalgan paytda «+ Xona qo‘shish» tugmasi orqali qo‘shishingiz mumkin.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-[rgba(167,139,250,0.15)]">
            {mode === 'edit' && initialRoom ? (
              <button
                type="button"
                onClick={() => {
                  const roomName = initialRoom.name
                    ? initialRoom.name.replace(/^(\d+)-xona$/i, '$1-PlayStation')
                    : `${initialRoom.id}-PlayStation`;
                  if (window.confirm(`${roomName}ni butunlay o‘chirishni tasdiqlaysizmi?`)) {
                    deleteRoom(initialRoom.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('rooms.deleteRoomBtn')}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:text-white hover:bg-[#25233B] text-xs font-bold transition cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.35)] transition cursor-pointer"
              >
                {mode === 'edit' ? t('rooms.editRoomBtn') : t('rooms.addRoomBtn')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
