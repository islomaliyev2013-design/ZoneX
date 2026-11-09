import React, { useState } from 'react';
import { Menu, Coins, Tv, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CloudSyncBadge from './CloudSyncBadge';
import LanguageSelector from './LanguageSelector';
import { formatDateDisplay, getTodayKey } from '../utils/formatters';

export default function Header({ onOpenMobileMenu }) {
  const {
    occupiedStationsCount,
    availableStationsCount,
    settings,
    updateSettings,
  } = useApp();
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [tempCurrency, setTempCurrency] = useState(settings.currency || "so'm");
  const [tempDefaultRate, setTempDefaultRate] = useState(settings.defaultHourlyRate || 20000);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      currency: tempCurrency.trim() || "so'm",
      defaultHourlyRate: Number(tempDefaultRate) || 20000,
    });
    setShowPricingModal(false);
  };

  const displayName = currentUser?.fullName || currentUser?.username || 'Admin';

  return (
    <>
      <header className="sticky top-0 z-20 bg-midnight-bg/95 backdrop-blur-md border-b border-midnight-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Menu Button + App Icon & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-midnight-card hover:bg-midnight-hover text-slate-300 hover:text-white border border-midnight-border transition"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-brand-purple/20 border border-brand-purple/40 flex-shrink-0 group hover:scale-105 transition-transform">
              <img src="/app-icon.jpg" alt="PlayStation Manager" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 leading-tight">
                <span>PlayStation <span className="text-brand-purpleLight">Manager</span></span>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30">
                  {isAdmin ? 'Administrator' : 'Manager'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">
                {displayName} • {formatDateDisplay(getTodayKey())}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Status Pill, Cloud Badge, Pricing Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Station Occupancy Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-card border border-midnight-border text-xs">
            <span className="relative flex h-2 w-2">
              {occupiedStationsCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gaming-red opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  occupiedStationsCount > 0 ? 'bg-gaming-red' : 'bg-gaming-green'
                }`}
              ></span>
            </span>
            <span className="text-gaming-red font-bold">{occupiedStationsCount}</span>
            <span className="text-slate-500">/</span>
            <span className="text-gaming-green font-bold">{availableStationsCount}</span>
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
              {t('nav.free')}
            </span>
          </div>

          {/* Cloud Sync Status */}
          <CloudSyncBadge />

          {/* Pricing Currency Button */}
          <button
            type="button"
            onClick={() => {
              setTempCurrency(settings.currency || "so'm");
              setTempDefaultRate(settings.defaultHourlyRate || 20000);
              setShowPricingModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-midnight-card hover:bg-midnight-hover text-slate-300 hover:text-white border border-midnight-border text-xs font-semibold transition"
            title={t('settings.pricingTitle')}
          >
            <Coins className="w-3.5 h-3.5 text-brand-purpleLight" />
            <span className="hidden sm:inline">{settings.currency}</span>
            <span className="hidden md:inline text-slate-400 font-mono">
              ({settings.defaultHourlyRate} so'm/soat)
            </span>
          </button>

          {/* Language Selector in Header for quick access */}
          <div className="hidden sm:block">
            <LanguageSelector variant="header" />
          </div>
        </div>

      </header>

      {/* Pricing Settings Modal (Midnight Purple Dark Theme) */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-midnight-card rounded-2xl p-6 w-full max-w-sm text-white shadow-2xl border border-midnight-border animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">
              {t('settings.pricingTitle')}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {t('settings.pricingSubtitle')}
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                  {t('settings.currencySymbol')}
                </label>
                <div className="flex gap-2">
                  {["so'm", 'UZS', '$', 'руб'].map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => setTempCurrency(curr)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        tempCurrency === curr
                          ? 'bg-brand-purple text-white border-brand-purple'
                          : 'bg-midnight-bg text-slate-300 hover:bg-midnight-hover border-midnight-border'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={tempCurrency}
                  onChange={(e) => setTempCurrency(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  placeholder="masalan: so'm, UZS"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                  {t('settings.defaultHourlyRate')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={tempDefaultRate}
                    onChange={(e) => setTempDefaultRate(e.target.value)}
                    className="w-full pl-4 pr-24 py-2 bg-midnight-bg border border-midnight-border rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    placeholder="20000"
                    required
                  />
                  <span className="absolute right-3.5 top-2 text-slate-400 text-xs font-bold pointer-events-none">
                    {tempCurrency} / soat
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-midnight-border flex items-center justify-between text-[11px] text-slate-400">
                <span>Supabase Cloud:</span>
                <span className="font-mono text-[10px] text-brand-purpleLight">
                  tqgcepxnarfgmgnryojc
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-midnight-border text-slate-300 hover:bg-midnight-hover font-semibold text-xs transition"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-white font-bold text-xs shadow-md shadow-brand-purple/30 transition"
                >
                  {t('settings.saveSettings')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

