import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tv,
  ShoppingBag,
  History,
  BarChart3,
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
  const { totalRooms, totalStations } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/rooms', label: t('nav.rooms'), icon: Tv },
    { to: '/sales', label: t('nav.sales'), icon: ShoppingBag },
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4] shadow-xs select-none">
      {/* Top Teal subtle accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#0D9488] to-transparent" />

      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px] gap-4">
          
          {/* 1. Left Side: Brand Logo with Gamepad Icon */}
          <NavLink
            to="/"
            className="flex items-center gap-3 group flex-shrink-0 transition-transform active:scale-95"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[#0D9488]/40 flex-shrink-0 group-hover:scale-105 transition-all">
              <img
                src="/app-icon.jpg"
                alt="PlayStation Manager"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-none">
              <div className="text-base sm:text-lg font-black tracking-tight text-[#292524] flex items-center gap-1.5 whitespace-nowrap">
                <span>PlayStation</span>
                <span className="text-[#0D9488] font-black">
                  Manager
                </span>
              </div>
              <div className="text-[10px] text-[#78716C] font-semibold tracking-wider uppercase mt-1 flex items-center gap-1.5 whitespace-nowrap">
                <span>{totalRooms} {t('common.roomPrefix')}</span>
                <span className="w-1 h-1 rounded-full bg-[#14B8A6]" />
                <span>{totalStations} {t('common.stationPrefix')}</span>
              </div>
            </div>
          </NavLink>

          {/* 2. Center: Minimal Clean Navigation Island */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F5F5F4] border border-[#E7E5E4] p-1 rounded-xl shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0D9488] text-white font-bold shadow-xs'
                        : 'text-[#78716C] hover:text-[#292524] hover:bg-white'
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
            <div className="flex items-center gap-2 pl-3 border-l border-[#E7E5E4]">
              <div
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-xs shadow-xs"
                title={`${t('nav.loggedInAs')} ${currentUser?.username || ''}`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#0D9488] flex items-center justify-center font-bold text-white text-xs shadow-xs flex-shrink-0">
                  {userInitial}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bold text-[#292524] text-xs">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-[#78716C] capitalize font-medium">
                    {currentUser?.role || 'admin'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white hover:bg-red-50 text-[#78716C] hover:text-[#DC2626] border border-[#E7E5E4] hover:border-red-200 transition shadow-xs cursor-pointer"
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
              className="p-2 rounded-xl bg-[#F5F5F4] text-[#292524] border border-[#E7E5E4] transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E7E5E4] px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top-2 shadow-xl">
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
                      ? 'bg-[#0D9488] text-white font-bold shadow-xs'
                      : 'text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#292524]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Mobile Footer User & Logout */}
          <div className="pt-3 mt-2 border-t border-[#E7E5E4] flex items-center justify-between text-xs text-[#78716C] px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0D9488] flex items-center justify-center font-bold text-white text-xs">
                {userInitial}
              </div>
              <div>
                <span className="font-bold text-[#292524] block leading-tight">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-[#78716C] capitalize font-medium">
                  {currentUser?.role || 'admin'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
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
