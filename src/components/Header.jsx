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
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Menu Button + App Icon & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#78716C] hover:text-[#292524] border border-[#E7E5E4] transition cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[#CCFBF1] flex-shrink-0 group hover:scale-105 transition-transform">
              <img src="/app-icon.jpg" alt="PlayStation Manager" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#292524] flex items-center gap-2 leading-tight">
                <span>PlayStation <span className="text-[#0D9488]">Manager</span></span>
                <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
                  {isAdmin ? 'Administrator' : 'Manager'}
                </span>
              </h2>
              <p className="text-[11px] text-[#78716C] font-medium leading-none mt-1">
                {displayName} • {formatDateDisplay(getTodayKey())}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Status Pill, Cloud Badge, Pricing Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Station Occupancy Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-xs">
            <span className="relative flex h-2 w-2">
              {occupiedStationsCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  occupiedStationsCount > 0 ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
                }`}
              ></span>
            </span>
            <span className="text-[#DC2626] font-bold">{occupiedStationsCount}</span>
            <span className="text-[#A8A29E]">/</span>
            <span className="text-[#16A34A] font-bold">{availableStationsCount}</span>
            <span className="text-[#78716C] text-[11px] font-medium hidden sm:inline">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5F5F4] text-[#292524] border border-[#E7E5E4] text-xs font-semibold transition cursor-pointer shadow-xs"
            title={t('settings.pricingTitle')}
          >
            <Coins className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="hidden sm:inline font-bold">{settings.currency}</span>
            <span className="hidden md:inline text-[#78716C] font-mono">
              ({settings.defaultHourlyRate} so'm/soat)
            </span>
          </button>

          {/* Language Selector in Header for quick access */}
          <div className="hidden sm:block">
            <LanguageSelector variant="header" />
          </div>
        </div>

      </header>

      {/* Pricing Settings Modal (Warm Gray + Teal Theme) */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-[#292524] shadow-2xl border border-[#E7E5E4] animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-[#292524] mb-1">
              {t('settings.pricingTitle')}
            </h3>
            <p className="text-xs text-[#78716C] mb-4">
              {t('settings.pricingSubtitle')}
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wide mb-1.5">
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
                          ? 'bg-[#0D9488] text-white border-[#0D9488]'
                          : 'bg-[#F5F5F4] text-[#78716C] hover:text-[#292524] border-[#E7E5E4]'
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
                  className="mt-2 w-full px-3 py-2 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-sm font-semibold text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
                  placeholder="masalan: so'm, UZS"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wide mb-1.5">
                  {t('settings.defaultHourlyRate')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={tempDefaultRate}
                    onChange={(e) => setTempDefaultRate(e.target.value)}
                    className="w-full pl-4 pr-24 py-2 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-sm font-bold text-[#292524] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]"
                    placeholder="20000"
                    required
                  />
                  <span className="absolute right-3.5 top-2 text-[#78716C] text-xs font-bold pointer-events-none">
                    {tempCurrency} / soat
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between text-[11px] text-[#78716C]">
                <span>Supabase Cloud:</span>
                <span className="font-mono text-[10px] text-[#0D9488] font-bold">
                  tqgcepxnarfgmgnryojc
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPricingModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#292524] font-semibold text-xs transition cursor-pointer"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm transition cursor-pointer"
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
