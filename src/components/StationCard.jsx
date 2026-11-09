import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, User, PlusCircle, Gamepad } from 'lucide-react';
import { formatTimer, formatCurrency } from '../utils/formatters';
import { calculateGamingPayment } from '../utils/calculations';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function StationCard({ station, onStartClick, onFinishClick, onAddProductsClick }) {
  const { settings } = useApp();
  const { t } = useLanguage();
  const currency = settings.currency || '$';
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
      className={`relative bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
        isOccupied
          ? 'border-rose-300 ring-1 ring-rose-200'
          : 'border-emerald-200 hover:border-emerald-300'
      }`}
    >
      {/* Top bar: Station Name & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                isOccupied
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Gamepad className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                {localizedStationName}
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                {localizedRoomName}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isOccupied ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              {t('station.occupied')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              {t('station.available')}
            </span>
          )}
        </div>

        {/* Card Body */}
        {isOccupied ? (
          <div className="space-y-3 my-2">
            {/* Customer name */}
            <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> {t('station.customer')}
              </span>
              <span className="font-bold text-slate-800">
                {station.session.customerName || t('common.walkIn')}
              </span>
            </div>

            {/* Live Elapsed Time Box */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('station.elapsedTime')}</span>
              </div>
              <div className="text-2xl font-black tracking-wider text-rose-950 font-mono">
                {formatTimer(elapsedMs)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-2">
                <span>{formatCurrency(station.session.hourlyPrice, currency)}/hr</span>
                <span>•</span>
                <span className="font-bold text-slate-700">
                  {t('station.total', { amount: formatCurrency(liveGamingCost, currency) })}
                </span>
              </div>
            </div>

            {/* Products attached indicator if any */}
            {productsCount > 0 && (
              <div className="text-[11px] text-blue-600 font-semibold px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100 flex items-center justify-between">
                <span>{t('station.productsOnSession')}</span>
                <span>{t('station.itemsCount', { count: productsCount })}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="my-6 text-center py-4 px-2 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">{t('station.readyForNext')}</p>
            <p className="text-sm font-bold text-slate-800">
              {t('station.defaultRate', {
                rate: formatCurrency(settings.defaultHourlyRate || 15, currency),
              })}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-3 border-t border-slate-100">
        {isOccupied ? (
          <div className="flex gap-2">
            {onAddProductsClick && (
              <button
                type="button"
                onClick={() => onAddProductsClick(station)}
                className="px-2.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold transition flex items-center justify-center"
                title={t('station.addProduct')}
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onFinishClick(station)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md hover:shadow-rose-600/30 flex items-center justify-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-white" />
              {t('station.finishSession')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onStartClick(station)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md hover:shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            {t('station.startSession')}
          </button>
        )}
      </div>
    </div>
  );
}
