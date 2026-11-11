import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  Clock,
  User,
  PlusCircle,
  Gamepad2,
  BellRing,
  VolumeX,
  Timer,
  Trash2,
} from 'lucide-react';
import { formatTimer, formatCurrency, formatDurationHuman } from '../utils/formatters';
import { calculateGamingPayment } from '../utils/calculations';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { playAlarm, stopAlarm } from '../utils/audioAlert';

export default function StationCard({
  station,
  onStartClick,
  onFinishClick,
  onAddProductsClick,
  onDeleteStationClick,
}) {
  const { settings } = useApp();
  const { t } = useLanguage();
  const currency = settings?.currency || "so'm";
  const isOccupied = station.status === 'occupied' && station.session != null;

  const session = station.session;
  const isTimed = Boolean(isOccupied && session?.isTimed && session?.targetEndTime);
  const targetEndTime = session?.targetEndTime || 0;
  const targetDurationMs = session?.targetDurationMs || 0;

  // Live timer tick
  const [elapsedMs, setElapsedMs] = useState(() => {
    if (isOccupied && session?.startTime) {
      return Math.max(0, Date.now() - session.startTime);
    }
    return 0;
  });

  const [remainingMs, setRemainingMs] = useState(() => {
    if (isTimed) {
      return Math.max(0, targetEndTime - Date.now());
    }
    return 0;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const prevSessionIdRef = useRef(session?.id);

  // Reset mute status when a new session starts
  useEffect(() => {
    if (session?.id !== prevSessionIdRef.current) {
      prevSessionIdRef.current = session?.id;
      setIsMuted(false);
      setIsRinging(false);
      stopAlarm(station.id);
    }
  }, [session?.id, station.id]);

  // Main 1-second interval loop for live time & alarm triggers
  useEffect(() => {
    if (!isOccupied || !session?.startTime) {
      setElapsedMs(0);
      setRemainingMs(0);
      setIsRinging(false);
      stopAlarm(station.id);
      return;
    }

    const checkTimeAndAlarm = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - session.startTime);
      setElapsedMs(elapsed);

      if (session.isTimed && session.targetEndTime) {
        const rem = Math.max(0, session.targetEndTime - now);
        setRemainingMs(rem);

        if (rem === 0) {
          // Time expired!
          if (!isMuted) {
            playAlarm(station.id);
            setIsRinging(true);
          } else {
            setIsRinging(false);
          }
        } else {
          setIsRinging(false);
        }
      } else {
        setIsRinging(false);
      }
    };

    checkTimeAndAlarm();
    const interval = setInterval(checkTimeAndAlarm, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [
    isOccupied,
    session?.id,
    session?.startTime,
    session?.isTimed,
    session?.targetEndTime,
    isMuted,
    station.id,
  ]);

  // Stop alarm on unmount
  useEffect(() => {
    return () => {
      stopAlarm(station.id);
    };
  }, [station.id]);

  const handleMute = (e) => {
    if (e) e.stopPropagation();
    stopAlarm(station.id);
    setIsMuted(true);
    setIsRinging(false);
  };

  const handleFinish = () => {
    stopAlarm(station.id);
    setIsRinging(false);
    onFinishClick(station);
  };

  const isExpired = isTimed && remainingMs <= 0;

  // Calculate live gaming cost
  const rawGamingCost = isOccupied ? calculateGamingPayment(elapsedMs, session.hourlyPrice) : 0;
  const liveGamingCost = isOccupied
    ? session.isTimed && session.targetBudget != null
      ? isExpired
        ? session.targetBudget
        : Math.min(session.targetBudget, rawGamingCost)
      : rawGamingCost
    : 0;

  const productsCount = session?.products?.length || 0;
  const localizedRoomName = station.roomName || t('rooms.roomN', { n: station.roomId });
  const localizedStationName = station.stationName || `${t('common.stationPrefix')} ${station.stationNumber}`;

  // Progress percentage for timed sessions
  const progressPercent =
    isTimed && targetDurationMs > 0
      ? Math.min(100, Math.max(0, Math.round((elapsedMs / targetDurationMs) * 100)))
      : 0;

  return (
    <div
      className={`relative bg-midnight-card rounded-2xl p-5 shadow-lg border transition-all duration-200 hover:shadow-xl flex flex-col justify-between h-full w-full ${
        isExpired
          ? 'border-gaming-red ring-4 ring-gaming-red/50 shadow-2xl shadow-gaming-red/30 animate-pulse'
          : isOccupied
          ? 'border-gaming-red/50 ring-1 ring-gaming-red/20'
          : 'border-midnight-border hover:border-brand-purple/50'
      }`}
    >
      {/* Top bar: Station Name & Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              isExpired
                ? 'bg-gaming-red text-white animate-bounce'
                : isOccupied
                ? 'bg-gaming-redBg text-gaming-red border border-gaming-red/30'
                : 'bg-brand-purple/15 text-brand-purpleLight border border-brand-purple/30'
            }`}
          >
            {isExpired ? <BellRing className="w-5 h-5" /> : <Gamepad2 className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-base text-white leading-tight truncate">
              {localizedStationName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium truncate">
                {localizedRoomName}
              </span>
              {station.zoneType && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                  {station.zoneType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge + Optional Delete Console Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isOccupied ? (
            <div className="flex items-center gap-1.5">
              {isExpired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gaming-red text-white border border-rose-300 shadow-md animate-pulse">
                  <BellRing className="w-3 h-3 animate-bounce" />
                  {t('station.timeExpired')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gaming-redBg text-gaming-red border border-gaming-red/40">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gaming-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gaming-red"></span>
                  </span>
                  {t('station.occupied')}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gaming-greenBg text-gaming-green border border-gaming-green/40">
                <span className="h-2 w-2 rounded-full bg-gaming-green"></span>
                {t('station.available')}
              </span>
              {onDeleteStationClick && (
                <button
                  type="button"
                  onClick={() => onDeleteStationClick(station)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title={t('rooms.deleteStationBtn')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Card Body - Flex-1 stretches to uniform height */}
      <div className="flex-1 flex flex-col justify-center my-3">
        {isOccupied ? (
          <div className="space-y-2.5 w-full">
            {/* Customer name */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-midnight-bg rounded-xl border border-midnight-border">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" /> {t('station.customer')}
              </span>
              <span className="font-bold text-white truncate max-w-[130px]">
                {session.customerName || t('common.walkIn')}
              </span>
            </div>

            {/* Time Expired Loud Alert Banner */}
            {isExpired && (
              <div className="p-2.5 rounded-xl bg-gaming-red text-white flex items-center justify-between shadow-lg shadow-gaming-red/30 border border-rose-400">
                <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
                  <BellRing className="w-4 h-4 animate-bounce shrink-0" />
                  <span>{t('station.timeExpired')}</span>
                </div>
                {!isMuted ? (
                  <button
                    type="button"
                    onClick={handleMute}
                    className="px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-white font-bold text-[11px] transition flex items-center gap-1 active:scale-95"
                    title={t('station.muteAlarm')}
                  >
                    <VolumeX className="w-3 h-3" />
                    {t('station.muteAlarm')}
                  </button>
                ) : (
                  <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-bold">
                    Ovoz o'chirildi
                  </span>
                )}
              </div>
            )}

            {/* Live Timer Box: Timed Countdown vs Open Elapsed */}
            {isTimed ? (
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  isExpired
                    ? 'bg-gaming-redBg/30 border-gaming-red'
                    : 'bg-midnight-bg border-brand-purple/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-0.5">
                  <span
                    className={`flex items-center gap-1.5 ${
                      isExpired ? 'text-gaming-red font-bold' : 'text-brand-purpleLight'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {isExpired ? t('station.timeExpired') : t('station.timeRemaining')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Limit:{' '}
                    {session.targetBudget
                      ? formatCurrency(session.targetBudget, currency)
                      : formatDurationHuman(targetDurationMs)}
                  </span>
                </div>

                {/* Digital Countdown Timer */}
                <div
                  className={`text-2xl font-black tracking-wider font-mono my-0.5 ${
                    isExpired ? 'text-gaming-red animate-pulse' : 'text-white'
                  }`}
                >
                  {formatTimer(remainingMs)}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-midnight-card rounded-full overflow-hidden mt-1.5 mb-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExpired
                        ? 'bg-gaming-red w-full'
                        : 'bg-gradient-to-r from-brand-purple to-cyan-accent'
                    }`}
                    style={{ width: isExpired ? '100%' : `${progressPercent}%` }}
                  />
                </div>

                <div
                  className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-2"
                  title={`O'tgan: ${formatTimer(elapsedMs)}`}
                >
                  <span>
                    {formatCurrency(session.hourlyPrice, currency)}{' '}
                    {t('station.perHour') || '/ soat'}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-brand-lavender">
                    {t('station.total', { amount: formatCurrency(liveGamingCost, currency) })}
                  </span>
                </div>
              </div>
            ) : (
              /* Classic Open-Ended Elapsed Time Box */
              <div className="p-3 bg-midnight-bg border border-gaming-red/30 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gaming-red mb-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('station.elapsedTime')}</span>
                </div>
                <div className="text-2xl font-black tracking-wider text-white font-mono">
                  {formatTimer(elapsedMs)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-2">
                  <span>
                    {formatCurrency(session.hourlyPrice, currency)}{' '}
                    {t('station.perHour') || '/ soat'}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-brand-lavender">
                    {t('station.total', { amount: formatCurrency(liveGamingCost, currency) })}
                  </span>
                </div>
              </div>
            )}

            {/* Products attached indicator if any */}
            {productsCount > 0 && (
              <div className="text-[11px] text-brand-purpleLight font-semibold px-2.5 py-1 bg-brand-purple/10 rounded-lg border border-brand-purple/20 flex items-center justify-between">
                <span>{t('station.productsOnSession')}</span>
                <span className="text-white font-bold">
                  {t('station.itemsCount', { count: productsCount })}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 px-3 rounded-xl bg-midnight-bg border border-midnight-border w-full">
            <p className="text-xs text-slate-400 mb-1">{t('station.readyForNext')}</p>
            <p className="text-sm font-bold text-white">
              {station.isUnlimitedOnly ? (
                <span className="text-cyan-300 font-extrabold">
                  {t('rooms.isUnlimitedLabel') || 'Vaqti cheklanmagan'} (
                  {formatCurrency(station.hourlyRate || settings?.defaultHourlyRate || 20000, currency)}
                  {t('station.perHour') || '/soat'})
                </span>
              ) : (
                t('station.defaultRate', {
                  rate: formatCurrency(
                    station.hourlyRate || settings?.defaultHourlyRate || 20000,
                    currency
                  ),
                })
              )}
            </p>
          </div>
        )}
      </div>

      {/* Buttons — Pinned cleanly at bottom with mt-auto */}
      <div className="pt-3 border-t border-midnight-border mt-auto w-full">
        {isOccupied ? (
          <div className="flex gap-2">
            {onAddProductsClick && (
              <button
                type="button"
                onClick={() => onAddProductsClick(station)}
                className="px-2.5 py-2.5 rounded-xl bg-midnight-bg hover:bg-midnight-hover text-slate-300 hover:text-white border border-midnight-border text-xs font-bold transition flex items-center justify-center cursor-pointer"
                title={t('station.addProduct')}
              >
                <PlusCircle className="w-4 h-4 text-brand-purpleLight" />
              </button>
            )}
            <button
              type="button"
              onClick={handleFinish}
              className={`flex-1 py-2.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer ${
                isExpired
                  ? 'bg-gaming-red hover:bg-rose-600 shadow-gaming-red/50 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-gaming-red hover:bg-rose-600 shadow-gaming-red/25'
              }`}
            >
              <Square className="w-4 h-4 fill-white" />
              {t('station.finishSession')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onStartClick(station)}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-slate-950 font-black text-sm shadow-md shadow-brand-purple/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            {t('station.startSession')}
          </button>
        )}
      </div>
    </div>
  );
}
