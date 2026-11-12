import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  LayoutDashboard,
  Tv,
  ShoppingBag,
  History,
  BarChart3,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const { currentUser, logout, isAdmin } = useAuth();
  const { t } = useLanguage();

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

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#101014] text-white select-none">
      {/* Top Section: Brand & Navigation */}
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[rgba(167,139,250,0.15)]">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[rgba(167,139,250,0.25)] flex-shrink-0">
              <img src="/app-icon.jpg" alt="PlayStation Manager" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="text-base font-extrabold tracking-tight text-white block leading-tight whitespace-nowrap">
                  PlayStation <span className="text-[#A78BFA]">Manager</span>
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-semibold tracking-wide block uppercase whitespace-nowrap">
                  {t('common.appSubtitle')}
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-[#1D1B2E] hover:bg-[#25233B] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)] transition cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.35)]'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#1D1B2E]'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Language, Admin Profile, Logout */}
      <div className="p-3 border-t border-[rgba(167,139,250,0.15)] space-y-3">
        {/* Language Selector */}
        <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center justify-between'}`}>
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Language
            </span>
          )}
          <LanguageSelector variant="sidebar" />
        </div>

        {/* Admin Profile Box */}
        <div
          className={`p-2.5 rounded-xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {currentUser?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-bold text-white truncate">
                    {currentUser?.username || 'admin'}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.3)] text-[9px] font-extrabold uppercase">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#A1A1AA] block truncate">
                  {currentUser?.fullName || 'Administrator'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title={t('auth.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* When collapsed, standalone logout icon button */}
        {isCollapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-xl text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            title={t('auth.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out border-r border-[rgba(167,139,250,0.15)] z-20 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
