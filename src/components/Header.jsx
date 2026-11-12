import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
      <header className="sticky top-0 z-20 bg-[#101014]/95 backdrop-blur-md border-b border-[rgba(167,139,250,0.15)] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Menu Button + App Icon & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-[#1D1B2E] hover:bg-[#25233B] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)] transition cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[rgba(167,139,250,0.25)] flex-shrink-0 group hover:scale-105 transition-transform">
              <img src="/app-icon.jpg" alt="PlayStation Manager" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 leading-tight">
                <span>PlayStation <span className="text-[#A78BFA]">Manager</span></span>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.3)]">
                  {isAdmin ? 'Administrator' : 'Manager'}
                </span>
              </h2>
              <p className="text-[11px] text-[#A1A1AA] font-medium leading-none mt-1">
                {displayName} • {formatDateDisplay(getTodayKey())}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Status Pill, Cloud Badge, Pricing Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Station Occupancy Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] text-xs">
            <span className="relative flex h-2 w-2">
              {occupiedStationsCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  occupiedStationsCount > 0 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
              ></span>
            </span>
            <span className="text-rose-400 font-bold">{occupiedStationsCount}</span>
            <span className="text-[#A1A1AA]/50">/</span>
            <span className="text-emerald-400 font-bold">{availableStationsCount}</span>
            <span className="text-[#A1A1AA] text-[11px] font-medium hidden sm:inline">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1D1B2E] hover:bg-[#25233B] text-white border border-[rgba(167,139,250,0.15)] text-xs font-semibold transition cursor-pointer shadow-xs"
            title={t('settings.pricingTitle')}
          >
            <Coins className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span className="hidden sm:inline font-bold">{settings.currency}</span>
            <span className="hidden md:inline text-[#A1A1AA] font-mono">
              ({settings.defaultHourlyRate} so'm/soat)
            </span>
          </button>

          {/* Language Selector in Header for quick access */}
          <div className="hidden sm:block">
            <LanguageSelector variant="header" />
          </div>
        </div>

      </header>

      {/* Pricing Settings Modal (Midnight Black + Purple Theme) */}
      {showPricingModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#1D1B2E] rounded-2xl p-6 w-full max-w-sm text-white shadow-2xl border border-[rgba(167,139,250,0.15)] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-white mb-1">
              {t('settings.pricingTitle')}
            </h3>
            <p className="text-xs text-[#A1A1AA] mb-4">
              {t('settings.pricingSubtitle')}
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                  {t('settings.currencySymbol')}
                </label>
                <div className="flex gap-2">
                  {["so'm", 'UZS', '$', 'руб'].map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => setTempCurrency(curr)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        tempCurrency === curr
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.3)]'
                          : 'bg-[#101014] text-[#A1A1AA] hover:text-white border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wide mb-1.5">
                  {t('settings.defaultHourlyRate')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={tempDefaultRate}
                    onChange={(e) => setTempDefaultRate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101014] border border-[rgba(167,139,250,0.2)] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[#A1A1AA] text-xs font-bold pointer-events-none">
                    {tempCurrency}/soat
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:bg-[#101014] hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-[0_0_15px_rgba(124,58,237,0.35)] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('common.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
