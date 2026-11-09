import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  LayoutDashboard,
  Tv,
  ShoppingBag,
  History,
  BarChart3,
  Coins,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const navigate = useNavigate();
  const {
    occupiedStationsCount,
    availableStationsCount,
    settings,
    updateSettings,
  } = useApp();
  const { currentUser, logout, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [tempCurrency, setTempCurrency] = useState(settings.currency || '$');
  const [tempDefaultRate, setTempDefaultRate] = useState(settings.defaultHourlyRate || 15);

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/rooms', label: t('nav.rooms'), icon: Tv },
    { to: '/sales', label: t('nav.sales'), icon: ShoppingBag },
    { to: '/history', label: t('nav.history'), icon: History },
    { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
  ];

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      currency: tempCurrency.trim() || '$',
      defaultHourlyRate: Number(tempDefaultRate) || 15,
    });
    setShowCurrencyModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-navy-950/95 backdrop-blur-md border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  PlayStation <span className="text-blue-500">Manager</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  {t('common.appSubtitle')}
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-navy-900/80 p-1.5 rounded-xl border border-navy-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-navy-800'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right side: Language Selector + Status pill + Settings + User / Logout */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Language Selector */}
              <LanguageSelector variant="header" />

              {/* Occupancy pill */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-navy-900 border border-navy-800 text-xs">
                <span className="relative flex h-2 w-2">
                  {occupiedStationsCount > 0 && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      occupiedStationsCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  ></span>
                </span>
                <span className="text-rose-400 font-bold">{occupiedStationsCount}</span>
                <span className="text-slate-500">/</span>
                <span className="text-emerald-400 font-bold">{availableStationsCount}</span>
                <span className="text-slate-400 text-[11px] font-medium">{t('nav.free')}</span>
              </div>

              {/* Pricing Settings Button */}
              <button
                onClick={() => {
                  setTempCurrency(settings.currency || '$');
                  setTempDefaultRate(settings.defaultHourlyRate || 15);
                  setShowCurrencyModal(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-800 text-xs font-semibold transition"
                title={t('settings.pricingTitle')}
              >
                <Coins className="w-3.5 h-3.5 text-blue-400" />
                <span>{settings.currency}</span>
              </button>

              {/* User badge & Logout */}
              <div className="flex items-center gap-1 pl-1 border-l border-navy-800">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-navy-900 border border-navy-800 text-xs text-slate-300 font-medium"
                  title={`${t('nav.loggedInAs')} ${currentUser?.username || ''}`}
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span className="max-w-[100px] truncate font-bold text-white">
                    {currentUser?.username || 'admin'}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-300 text-[9px] font-extrabold uppercase">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl bg-navy-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-navy-800 hover:border-rose-900/50 transition"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile menu and language toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <LanguageSelector variant="header" />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-navy-900 text-slate-300 hover:text-white border border-navy-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-950 border-b border-navy-800 px-4 pt-2 pb-4 space-y-1.5 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}

            <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400 px-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{currentUser?.username}</span>
                <span>({occupiedStationsCount} {t('nav.busy')} • {availableStationsCount} {t('nav.free')})</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Pricing Settings Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {t('settings.pricingTitle')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t('settings.pricingSubtitle')}
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {t('settings.currencySymbol')}
                </label>
                <div className="flex gap-2">
                  {['$', 'UZS', 'руб', '€', '£', '₸'].map((curr) => (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => setTempCurrency(curr)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        tempCurrency === curr
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
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
                  className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. $, UZS, руб"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {t('settings.defaultHourlyRate')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">
                    {tempCurrency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={tempDefaultRate}
                    onChange={(e) => setTempDefaultRate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCurrencyModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition"
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
