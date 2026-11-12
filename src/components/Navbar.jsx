import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tv,
  ShoppingBag,
  History,
  BarChart3,
  ReceiptText,
  Smartphone,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const { totalRooms, totalStations, unpaidDebtsCount = 0 } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/rooms', label: t('nav.rooms'), icon: Tv },
    { to: '/sales', label: t('nav.sales'), icon: ShoppingBag },
    {
      to: '/debts',
      label: t('nav.debts'),
      icon: ReceiptText,
      badge: unpaidDebtsCount > 0 ? unpaidDebtsCount : null,
    },
    {
      to: '/click',
      label: t('nav.click'),
      icon: Smartphone,
    },
    { to: '/history', label: t('nav.history'), icon: History },
    { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
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
    <header className="sticky top-0 z-30 bg-[#101014]/90 backdrop-blur-md border-b border-[rgba(167,139,250,0.15)] shadow-md select-none">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] gap-2 lg:gap-4">
          
          {/* 1. Left Side: Brand Logo with Gamepad Icon */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0 transition-transform active:scale-95"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-[rgba(167,139,250,0.25)] flex-shrink-0 group-hover:scale-105 transition-all">
              <img
                src="/app-icon.jpg"
                alt="PlayStation Manager"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-none">
              <div className="text-sm sm:text-base xl:text-lg font-black tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
                <span>PlayStation</span>
                <span className="text-[#A78BFA] font-black">
                  Manager
                </span>
              </div>
              <div className="text-[10px] text-[#A1A1AA] font-semibold tracking-wider uppercase mt-1 flex items-center gap-1.5 whitespace-nowrap">
                <span>{totalRooms} {t('common.roomPrefix')}</span>
                <span className="w-1 h-1 rounded-full bg-[#7C3AED]" />
                <span>{totalStations} {t('common.stationPrefix')}</span>
              </div>
            </div>
          </NavLink>

          {/* 2. Center: Minimal Clean Navigation Island */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] p-1 rounded-xl shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-[#7C3AED] text-white font-black shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#25233B]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* 3. Right Side: Language Selector + User Profile + Logout */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {/* Language Selector Dropdown */}
            <LanguageSelector variant="header" />

            {/* User Profile Pill & Logout Button */}
            <div className="flex items-center gap-1.5 xl:gap-2 pl-2 xl:pl-3 border-l border-[rgba(167,139,250,0.15)]">
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] text-xs shadow-xs"
                title={`${t('nav.loggedInAs')} ${currentUser?.username || ''}`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center font-bold text-white text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)] flex-shrink-0">
                  {userInitial}
                </div>
                <div className="flex flex-col text-left leading-tight max-w-[100px] xl:max-w-[130px]">
                  <span className="font-bold text-white text-xs truncate">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-[#A1A1AA] capitalize font-medium">
                    {currentUser?.role || 'admin'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#1D1B2E] hover:bg-rose-500/20 text-[#A1A1AA] hover:text-rose-400 border border-[rgba(167,139,250,0.15)] hover:border-rose-500/30 transition shadow-xs cursor-pointer flex-shrink-0"
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
              className="p-2 rounded-xl bg-[#1D1B2E] text-white border border-[rgba(167,139,250,0.15)] transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1D1B2E] border-t border-[rgba(167,139,250,0.15)] px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#7C3AED] text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                      : 'text-[#A1A1AA] hover:bg-[#25233B] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge != null && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-black rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Mobile Footer User & Logout */}
          <div className="pt-3 mt-2 border-t border-[rgba(167,139,250,0.15)] flex items-center justify-between text-xs text-[#A1A1AA] px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center font-bold text-white text-xs shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                {userInitial}
              </div>
              <div>
                <span className="font-bold text-white block leading-tight">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-[#A1A1AA] capitalize font-medium">
                  {currentUser?.role || 'admin'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
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
