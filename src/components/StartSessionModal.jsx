import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  X,
  User,
  Tv,
  Clock,
  Timer,
  Coins,
  BellRing,
  Volume2,
  ShoppingBag,
  Plus,
  Minus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import { calculateDurationFromBudget, calculateBudgetFromDuration } from '../utils/calculations';
import { testAlarmSound } from '../utils/audioAlert';
import { ROOM_DEFAULT_CONFIGS } from '../utils/storage';

export default function StartSessionModal({ station, isOpen, onClose }) {
  const { settings, productsCatalog = [], startSession } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";

  const catalogList = Array.isArray(productsCatalog) ? productsCatalog : [];

  const [hourlyPrice, setHourlyPrice] = useState(
    settings.defaultHourlyRate != null ? settings.defaultHourlyRate : 20000
  );
  const [customerName, setCustomerName] = useState('');
  
  // Session type: 'open' (unlimited) or 'timed' (with alarm countdown)
  const [sessionType, setSessionType] = useState('open');
  // Timed sub-mode: 'budget' (by money amount) or 'duration' (by minutes)
  const [limitMode, setLimitMode] = useState('budget');
  const [budgetAmount, setBudgetAmount] = useState('20000');
  const [durationMinutes, setDurationMinutes] = useState('60');

  // Selected products state: { [productId]: quantity }
  const [productQuantities, setProductQuantities] = useState({});

  // Always reset inputs when modal opens for a new station
  useEffect(() => {
    if (isOpen && station) {
      const defaultRate =
        ROOM_DEFAULT_CONFIGS[station.roomId]?.hourlyRate != null
          ? ROOM_DEFAULT_CONFIGS[station.roomId].hourlyRate
          : station.hourlyRate != null
          ? station.hourlyRate
          : settings.defaultHourlyRate != null
          ? settings.defaultHourlyRate
          : 20000;
      setHourlyPrice(defaultRate);
      setCustomerName('');
      setSessionType('open');
      setLimitMode('budget');
      setBudgetAmount(defaultRate.toString());
      setDurationMinutes('60');
      setProductQuantities({});
    }
  }, [isOpen, station?.id, station?.roomId, settings.defaultHourlyRate]);

  if (!isOpen || !station) return null;

  // Product selection helpers
  const handleIncrementProduct = (item) => {
    setProductQuantities((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleDecrementProduct = (itemId) => {
    setProductQuantities((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: current - 1,
      };
    });
  };

  const handleClearProducts = () => {
    setProductQuantities({});
  };

  const selectedProducts = Object.entries(productQuantities)
    .map(([id, qty]) => {
      const item = catalogList.find((c) => c.id === id);
      if (!item || qty <= 0) return null;
      return {
        id: `p_init_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
        name: item.name,
        quantity: qty,
        purchasePrice: item.purchasePrice || 0,
        sellingPrice: item.sellingPrice || 0,
      };
    })
    .filter(Boolean);

  const selectedProductsCount = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
  const selectedProductsTotal = selectedProducts.reduce(
    (sum, p) => sum + p.quantity * p.sellingPrice,
    0
  );

  const getProductEmoji = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('pringles')) return '🥫';
    if (n.includes('doritos')) return '🔺';
    if (n.includes('cheetos')) return '🐆';
    if (n.includes('chip') || n.includes('lays')) return '🥔';
    if (n.includes('suxarik') || n.includes('flint') || n.includes('kiriyej')) return '🥖';
    if (n.includes('popkorn') || n.includes('popcorn')) return '🍿';
    if (n.includes('semichka') || n.includes('pista')) return '🌻';
    if (n.includes('cola') || n.includes('pepsi')) return '🥤';
    if (n.includes('fanta')) return '🍊';
    if (n.includes('sprite')) return '🍋';
    if (n.includes('suv') || n.includes('water')) return '💧';
    if (n.includes('red bull') || n.includes('energy') || n.includes('flash')) return '⚡';
    if (n.includes('snicker') || n.includes('twix') || n.includes('kitkat') || n.includes('choc')) return '🍫';
    if (n.includes('bounty')) return '🥥';
    if (n.includes('coffee') || n.includes('qahva') || n.includes('nescafe')) return '☕';
    return '🍿';
  };

  // Calculate allocated duration / budget
  const numericHourlyRate = Math.max(1, Number(hourlyPrice) || 20000);

  let computedDurationMs = 0;
  let computedBudget = 0;

  if (sessionType === 'timed') {
    if (limitMode === 'budget') {
      const b = Number(budgetAmount) || 0;
      computedBudget = b;
      computedDurationMs = calculateDurationFromBudget(b, numericHourlyRate, 0);
    } else {
      const mins = Number(durationMinutes) || 0;
      computedDurationMs = mins * 60 * 1000;
      computedBudget = calculateBudgetFromDuration(mins, numericHourlyRate);
    }
  }

  // Helper for human-readable allocated time string
  const formatAllocatedTimeString = (ms) => {
    if (ms <= 0) return '0 daqiqa';
    const totalSec = Math.round(ms / 1000);
    if (totalSec < 60) {
      return `${totalSec} soniya`;
    }
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return mins > 0 ? `${hrs} soat ${mins} daqiqa` : `${hrs} soat`;
    }
    return secs > 0 ? `${mins} daqiqa ${secs} soniya` : `${mins} daqiqa`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hourlyPrice || Number(hourlyPrice) <= 0) {
      alert(t('sessionModal.hourlyPriceRequired'));
      return;
    }

    if (sessionType === 'timed' && computedDurationMs <= 0) {
      alert("Iltimos, belgilangan summa yoki vaqtni kiriting");
      return;
    }

    startSession(station.id, {
      hourlyPrice: Number(hourlyPrice),
      customerName: customerName.trim(),
      isTimed: sessionType === 'timed',
      limitType: limitMode,
      targetDurationMs: sessionType === 'timed' ? computedDurationMs : 0,
      targetBudget: sessionType === 'timed' ? computedBudget : null,
      products: selectedProducts,
    });

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
      <div className="bg-[#1D1B2E] rounded-2xl w-full max-w-lg text-white shadow-2xl border border-[rgba(167,139,250,0.15)] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Sticky Header — Always Visible */}
        <div className="shrink-0 px-5 py-3.5 bg-[#1D1B2E] text-white flex items-center justify-between border-b border-[rgba(167,139,250,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight flex items-center gap-2">
                <span>
                  {t('sessionModal.startTitle', {
                    room: localizedRoomName,
                    station: localizedStationName,
                  })}
                </span>
                {station.zoneType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#7C3AED]/20 text-[#A78BFA] border-[rgba(167,139,250,0.3)]">
                    {station.zoneType}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">
                {t('sessionModal.startSubtitle')} •{' '}
                <span className="font-bold text-[#A78BFA]">
                  {station.roomId === 3 || station.isUnlimitedOnly
                    ? `${t('infoPage.room3Badge') || 'Vaqti cheklanmagan'} (${formatCurrency(ROOM_DEFAULT_CONFIGS[3]?.hourlyRate || 30000, currency)}${t('station.perHour') || '/soat'})`
                    : `${formatCurrency(ROOM_DEFAULT_CONFIGS[station.roomId]?.hourlyRate || station.hourlyRate || 20000, currency)}${t('station.perHour') || '/soat'}`}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#101014] transition cursor-pointer"
            title={t('common.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            
            {/* Hourly Price */}
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                {t('sessionModal.hourlyPrice')} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={hourlyPrice}
                  onChange={(e) => setHourlyPrice(e.target.value)}
                  placeholder="20000"
                  className="w-full pl-4 pr-32 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition"
                  required
                />
                <span className="absolute right-3.5 top-3 text-[#A1A1AA] text-xs font-bold pointer-events-none">
                  {currency} / soat
                </span>
              </div>
              {/* Quick Increment Buttons */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) + 1000))}
                  className="px-2.5 py-1 rounded-lg bg-[#101014] hover:bg-[#7C3AED]/20 text-[#A1A1AA] hover:text-[#A78BFA] border border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 text-xs font-bold transition cursor-pointer"
                >
                  +1 000
                </button>
                <button
                  type="button"
                  onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) + 5000))}
                  className="px-2.5 py-1 rounded-lg bg-[#101014] hover:bg-[#7C3AED]/20 text-[#A1A1AA] hover:text-[#A78BFA] border border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 text-xs font-bold transition cursor-pointer"
                >
                  +5 000
                </button>
                <button
                  type="button"
                  onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) + 10000))}
                  className="px-2.5 py-1 rounded-lg bg-[#101014] hover:bg-[#7C3AED]/20 text-[#A1A1AA] hover:text-[#A78BFA] border border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 text-xs font-bold transition cursor-pointer"
                >
                  +10 000
                </button>
                <button
                  type="button"
                  onClick={() => setHourlyPrice((prev) => Math.max(0, Number(prev || 0) - 1000))}
                  className="px-2.5 py-1 rounded-lg bg-[#101014] hover:bg-rose-500/20 text-[#A1A1AA] hover:text-rose-400 border border-[rgba(167,139,250,0.15)] hover:border-rose-500/30 text-xs font-bold transition cursor-pointer"
                >
                  -1 000
                </button>
              </div>
            </div>

            {/* 3-xona Vaqti Cheklanmagan Notification */}
            {(station.roomId === 3 || station.isUnlimitedOnly) && (
              <div className="p-3 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center gap-2.5 text-[#A78BFA] text-xs font-semibold">
                <Clock className="w-4 h-4 shrink-0 text-[#A78BFA]" />
                <span>
                  {t('infoPage.room3Badge') || 'Vaqti cheklanmagan'}: 3-xona ochiq cheksiz seans rejimida ishlaydi.
                </span>
              </div>
            )}

            {/* Session Type Selector: Open vs Timed */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                {t('sessionModal.sessionType')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionType('open')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    sessionType === 'open'
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white ring-1 ring-[#7C3AED]/40 shadow-[0_0_15px_rgba(124,58,237,0.25)]'
                      : 'bg-[#101014] border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:text-white hover:border-[#7C3AED]/40'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      sessionType === 'open'
                        ? 'bg-[#7C3AED] text-white font-bold'
                        : 'bg-[#1D1B2E] text-[#A1A1AA] border border-[rgba(167,139,250,0.15)]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t('sessionModal.typeOpen')}</div>
                    <div className="text-[10px] text-[#A1A1AA] line-clamp-1">{t('sessionModal.typeOpenDesc')}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionType('timed')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                    sessionType === 'timed'
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white ring-1 ring-[#7C3AED]/40 shadow-[0_0_15px_rgba(124,58,237,0.25)]'
                      : 'bg-[#101014] border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:text-white hover:border-[#7C3AED]/40'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      sessionType === 'timed'
                        ? 'bg-[#7C3AED] text-white font-bold'
                        : 'bg-[#1D1B2E] text-[#A1A1AA] border border-[rgba(167,139,250,0.15)]'
                    }`}
                  >
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t('sessionModal.typeTimed')}</div>
                    <div className="text-[10px] text-[#A1A1AA] line-clamp-1">{t('sessionModal.typeTimedDesc')}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Timed Session Options */}
            {sessionType === 'timed' && (
              <div className="p-4 rounded-xl bg-[#101014]/60 border border-[rgba(167,139,250,0.15)] space-y-3.5 animate-in fade-in duration-200">
                {/* Timed Sub-mode: Summa bo'yicha vs Vaqt bo'yicha */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A1A1AA]">
                    {limitMode === 'budget'
                      ? t('sessionModal.budgetLabel')
                      : t('sessionModal.durationLabel')}
                  </span>
                  <div className="flex items-center gap-1 bg-[#101014] p-0.5 rounded-lg border border-[rgba(167,139,250,0.15)]">
                    <button
                      type="button"
                      onClick={() => setLimitMode('budget')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        limitMode === 'budget'
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <Coins className="w-3 h-3 inline mr-1" />
                      {t('sessionModal.byBudget')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLimitMode('duration')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        limitMode === 'duration'
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <Timer className="w-3 h-3 inline mr-1" />
                      {t('sessionModal.byDuration')}
                    </button>
                  </div>
                </div>

                {/* Mode 1: Budget (So'm) */}
                {limitMode === 'budget' && (
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        placeholder="20000"
                        className="w-full pl-4 pr-20 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition"
                      />
                      <span className="absolute right-3.5 top-3 text-[#A1A1AA] text-xs font-bold pointer-events-none">
                        {currency}
                      </span>
                    </div>

                    {/* Quick Preset Chips for Budget */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {['10000', '20000', '30000', '50000', '100000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudgetAmount(preset)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                            budgetAmount === preset
                              ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                              : 'bg-[#1D1B2E] text-[#A1A1AA] border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 hover:text-white'
                          }`}
                        >
                          {parseInt(preset, 10).toLocaleString('ru-RU')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mode 2: Duration (Minutes) */}
                {limitMode === 'duration' && (
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        placeholder="60"
                        className="w-full pl-4 pr-24 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition"
                      />
                      <span className="absolute right-3.5 top-3 text-[#A1A1AA] text-xs font-bold pointer-events-none">
                        daqiqa
                      </span>
                    </div>

                    {/* Quick Preset Chips for Duration */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {[
                        { val: '30', label: '30 daq' },
                        { val: '60', label: '1 soat' },
                        { val: '90', label: '1.5 soat' },
                        { val: '120', label: '2 soat' },
                        { val: '180', label: '3 soat' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setDurationMinutes(item.val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                            durationMinutes === item.val
                              ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                              : 'bg-[#1D1B2E] text-[#A1A1AA] border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real-time Calculation Display */}
                <div className="p-3 rounded-xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] flex items-center justify-between text-xs">
                  <span className="text-[#A1A1AA] font-semibold">
                    {limitMode === 'budget'
                      ? t('sessionModal.allocatedTime')
                      : t('sessionModal.computedCost')}
                  </span>
                  <span className="font-extrabold text-[#A78BFA] text-sm font-mono">
                    {limitMode === 'budget'
                      ? formatAllocatedTimeString(computedDurationMs)
                      : formatCurrency(computedBudget, currency)}
                  </span>
                </div>

                {/* Alarm Notification Banner & Sound Test */}
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A78BFA] text-xs">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 shrink-0 text-[#A78BFA] animate-pulse" />
                    <span className="text-[11px] leading-tight font-semibold">
                      {t('sessionModal.alarmNotice')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={testAlarmSound}
                    className="px-2.5 py-1 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                    title="Ovozni eshitib ko'rish"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Ovoz
                  </button>
                </div>

                {/* Mahsulotlar (Ichimliklar & Gazaklar - Cola, Semichka va h.k.) */}
                <div className="pt-3 border-t border-[rgba(167,139,250,0.15)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-tight">
                          {t('sessionModal.sessionProductsTitle')}
                        </span>
                        <span className="text-[10px] text-[#A1A1AA]">
                          {t('sessionModal.sessionProductsSubtitle')}
                        </span>
                      </div>
                    </div>
                    {selectedProductsCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.3)]">
                          {selectedProductsCount} ta • {formatCurrency(selectedProductsTotal, currency)}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearProducts}
                          className="text-[10px] text-[#A1A1AA] hover:text-rose-400 underline font-semibold transition cursor-pointer"
                        >
                          Tozalash
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fast 1-click Products Grid */}
                  {catalogList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catalogList.map((item) => {
                        const qty = productQuantities[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all duration-150 ${
                              qty > 0
                                ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.2)]'
                                : 'bg-[#1D1B2E] border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 text-white'
                            }`}
                          >
                            <div className="min-w-0 pr-1.5 flex items-center gap-2 flex-1">
                              <span className="text-base select-none shrink-0">
                                {getProductEmoji(item.name)}
                              </span>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-white block truncate leading-tight">
                                  {item.name}
                                </span>
                                <span className="text-[11px] font-semibold text-[#A78BFA] block mt-0.5">
                                  {formatCurrency(item.sellingPrice, currency)}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              {qty > 0 ? (
                                <div className="flex items-center gap-1 bg-[#101014] p-0.5 rounded-lg border border-[#7C3AED]/40">
                                  <button
                                    type="button"
                                    onClick={() => handleDecrementProduct(item.id)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-[#1D1B2E] hover:bg-rose-500/20 text-[#A1A1AA] hover:text-rose-400 text-xs font-bold transition cursor-pointer"
                                    title="1 ta kamaytirish"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-extrabold text-white">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleIncrementProduct(item)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black transition cursor-pointer"
                                    title="1 ta qo'shish"
                                  >
                                    <Plus className="w-3 h-3 stroke-[3]" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleIncrementProduct(item)}
                                  className="px-2 py-1 rounded-lg bg-[#101014] hover:bg-[#7C3AED]/20 text-[#A1A1AA] hover:text-[#A78BFA] border border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3 text-[#A78BFA]" />
                                  <span>Qo‘shish</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] text-center text-xs text-[#A1A1AA]">
                      {t('sessionModal.noProductsCatalog') || "Mahsulotlar mavjud emas. Mahsulot qo'shish uchun Sotuvlar bo'limiga o'ting."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                {t('sessionModal.customerName')}{' '}
                <span className="text-[#A1A1AA]/60 text-[10px] font-normal">
                  {t('sessionModal.optional')}
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[#A1A1AA]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('sessionModal.customerNamePlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-sm font-semibold text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition"
                />
              </div>
            </div>

          </div>

          {/* Summary of products & total if products selected */}
          {selectedProductsTotal > 0 && (
            <div className="shrink-0 px-5 py-2.5 bg-[#101014] border-t border-[rgba(167,139,250,0.15)] flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] font-semibold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>{t('sessionModal.totalWithProducts')}</span>
              </span>
              <span className="font-extrabold text-[#A78BFA] text-sm">
                {formatCurrency(
                  (sessionType === 'timed' ? computedBudget : 0) + selectedProductsTotal,
                  currency
                )}
              </span>
            </div>
          )}

          {/* Sticky Footer Action Buttons */}
          <div className="shrink-0 px-5 py-3.5 bg-[#1D1B2E] border-t border-[rgba(167,139,250,0.15)] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:bg-[#101014] hover:text-white font-semibold text-sm transition cursor-pointer"
            >
              {t('sessionModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {t('sessionModal.startSessionBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
