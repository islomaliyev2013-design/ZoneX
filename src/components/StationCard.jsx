import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, User, PlusCircle, Gamepad2 } from 'lucide-react';
import { formatTimer, formatCurrency } from '../utils/formatters';
import { calculateGamingPayment } from '../utils/calculations';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function StationCard({ station, onStartClick, onFinishClick, onAddProductsClick }) {
  const { settings } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || "so'm";
  const isOccupied = station.status === 'occupied' && station.session != null;

  // Live timer tick for occupied sessions
  const [elapsedMs, setElapsedMs] = useState(() => {
    if (isOccupied && station.session?.startTime) {
      return Math.max(0, Date.now() - station.session.startTime);
    }
    return 0;
  });

  useEffect(() => {
    if (!isOccupied || !station.session?.startTime) {
      setElapsedMs(0);
      return;
    }

    setElapsedMs(Math.max(0, Date.now() - station.session.startTime));

    const interval = setInterval(() => {
      setElapsedMs(Math.max(0, Date.now() - station.session.startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOccupied, station.session?.startTime]);

  const liveGamingCost = isOccupied
    ? calculateGamingPayment(elapsedMs, station.session.hourlyPrice)
    : 0;

  const productsCount = station.session?.products?.length || 0;

  const localizedRoomName = t('rooms.roomN', { n: station.roomId });
  const localizedStationName = `${t('common.stationPrefix')} ${station.stationNumber}`;

  return (
    <div
      className={`relative bg-midnight-card rounded-2xl p-5 shadow-lg border transition-all duration-200 hover:shadow-xl flex flex-col justify-between ${
        isOccupied
          ? 'border-gaming-red/50 ring-1 ring-gaming-red/20'
          : 'border-midnight-border hover:border-brand-purple/50'
      }`}
    >
      {/* Top bar: Station Name & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                isOccupied
                  ? 'bg-gaming-redBg text-gaming-red border border-gaming-red/30'
                  : 'bg-brand-purple/15 text-brand-purpleLight border border-brand-purple/30'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-white leading-tight">
                {localizedStationName}
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                {localizedRoomName}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isOccupied ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gaming-redBg text-gaming-red border border-gaming-red/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gaming-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gaming-red"></span>
              </span>
              {t('station.occupied')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gaming-greenBg text-gaming-green border border-gaming-green/40">
              <span className="h-2 w-2 rounded-full bg-gaming-green"></span>
              {t('station.available')}
            </span>
          )}
        </div>

        {/* Card Body */}
        {isOccupied ? (
          <div className="space-y-3 my-2">
            {/* Customer name */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-midnight-bg rounded-xl border border-midnight-border">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" /> {t('station.customer')}
              </span>
              <span className="font-bold text-white truncate max-w-[130px]">
                {station.session.customerName || t('common.walkIn')}
              </span>
            </div>

            {/* Live Elapsed Time Box */}
            <div className="p-3 bg-midnight-bg border border-gaming-red/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gaming-red mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('station.elapsedTime')}</span>
              </div>
              <div className="text-2xl font-black tracking-wider text-white font-mono">
                {formatTimer(elapsedMs)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-2">
                <span>{formatCurrency(station.session.hourlyPrice, currency)} / soat</span>
                <span>•</span>
                <span className="font-bold text-brand-lavender">
                  {t('station.total', { amount: formatCurrency(liveGamingCost, currency) })}
                </span>
              </div>
            </div>

            {/* Products attached indicator if any */}
            {productsCount > 0 && (
              <div className="text-[11px] text-brand-purpleLight font-semibold px-2.5 py-1 bg-brand-purple/10 rounded-lg border border-brand-purple/20 flex items-center justify-between">
                <span>{t('station.productsOnSession')}</span>
                <span className="text-white font-bold">{t('station.itemsCount', { count: productsCount })}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="my-6 text-center py-4 px-3 rounded-xl bg-midnight-bg border border-midnight-border">
            <p className="text-xs text-slate-400 mb-1">{t('station.readyForNext')}</p>
            <p className="text-sm font-bold text-white">
              {t('station.defaultRate', {
                rate: formatCurrency(settings.defaultHourlyRate || 20000, currency),
              })}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-3 border-t border-midnight-border">
        {isOccupied ? (
          <div className="flex gap-2">
            {onAddProductsClick && (
              <button
                type="button"
                onClick={() => onAddProductsClick(station)}
                className="px-2.5 py-2.5 rounded-xl bg-midnight-bg hover:bg-midnight-hover text-slate-300 hover:text-white border border-midnight-border text-xs font-bold transition flex items-center justify-center"
                title={t('station.addProduct')}
              >
                <PlusCircle className="w-4 h-4 text-brand-purpleLight" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onFinishClick(station)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gaming-red hover:bg-rose-600 text-white font-extrabold text-sm shadow-md shadow-gaming-red/25 flex items-center justify-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-white" />
              {t('station.finishSession')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onStartClick(station)}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-white font-extrabold text-sm shadow-md shadow-brand-purple/25 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            {t('station.startSession')}
          </button>
        )}
      </div>
    </div>
  );
}
