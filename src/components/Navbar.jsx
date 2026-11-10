import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tv,
  ShoppingBag,
  History,
  BarChart3,
  Info,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/rooms', label: t('nav.rooms'), icon: Tv },
    { to: '/sales', label: t('nav.sales'), icon: ShoppingBag },
    { to: '/history', label: t('nav.history'), icon: History },
    { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
    { to: '/info', label: t('nav.info'), icon: Info },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = (
    currentUser?.fullName?.[0] ||
    currentUser?.username?.[0] ||
    'A'
  ).toUpperCase();
  const userDisplayName = currentUser?.username || currentUser?.fullName || 'admin';

  return (
    <header className="sticky top-0 z-30 bg-[#0D131D]/95 backdrop-blur-xl border-b border-[#253449] shadow-[0_4px_25px_rgba(0,0,0,0.5)] select-none">
      {/* Top Electric Cyan glowing accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#06B6D4]/80 to-transparent" />

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-4">
          
          {/* 1. Left Side: Brand Logo with Neon Gamepad Icon */}
          <NavLink
            to="/"
            className="flex items-center gap-3.5 group flex-shrink-0 transition-transform active:scale-95"
          >
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-[#06B6D4]/50 flex-shrink-0 group-hover:scale-105 transition-all">
              <img
                src="/app-icon.jpg"
                alt="PlayStation Manager"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-none">
              <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                <span>PlayStation</span>
                <span className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] bg-clip-text text-transparent font-extrabold">
                  Manager
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1 flex items-center gap-1.5 whitespace-nowrap">
                <span>5 {t('common.roomPrefix')}</span>
                <span className="w-1 h-1 rounded-full bg-[#22D3EE]" />
                <span>25 {t('common.stationPrefix')}</span>
              </div>
            </div>
          </NavLink>

          {/* 2. Center: Floating Sleek Navigation Island */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#151E2B]/95 border border-[#253449] p-1.5 rounded-2xl shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-slate-950 font-black shadow-lg shadow-[#06B6D4]/30 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* 3. Right Side: Language Selector + User Profile + Logout */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {/* Language Selector Dropdown */}
            <LanguageSelector variant="header" />

            {/* User Profile Pill & Logout Button */}
            <div className="flex items-center gap-2 pl-3 border-l border-[#253449]">
              <div
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#151E2B] border border-[#253449] text-xs shadow-xs"
                title={`${t('nav.loggedInAs')} ${currentUser?.username || ''}`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#06B6D4] to-[#22D3EE] flex items-center justify-center font-black text-slate-950 text-xs shadow-sm flex-shrink-0">
                  {userInitial}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-extrabold text-white text-xs">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {currentUser?.role || 'admin'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#151E2B] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#253449] hover:border-red-500/30 transition shadow-xs cursor-pointer"
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector variant="header" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#151E2B] text-white border border-[#253449] transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D131D] border-t border-[#253449] px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? 'bg-[#06B6D4] text-slate-950 font-black shadow-md shadow-[#06B6D4]/30'
                      : 'text-slate-300 hover:bg-[#151E2B] hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Mobile Footer User & Logout */}
          <div className="pt-3 mt-2 border-t border-[#253449] flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center font-black text-slate-950 text-xs">
                {userInitial}
              </div>
              <div>
                <span className="font-bold text-white block leading-tight">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser?.role || 'admin'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-gaming-redBg text-gaming-red border border-gaming-red/30 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
