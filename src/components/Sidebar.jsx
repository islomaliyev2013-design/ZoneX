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
    <div className="flex flex-col h-full justify-between bg-midnight-sidebar text-white select-none">
      {/* Top Section: Brand & Navigation */}
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-midnight-border">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-brand-purple/20 group-hover:scale-105 transition-transform flex-shrink-0 border border-brand-purple/40">
              <img src="/app-icon.jpg" alt="PlayStation Manager" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="text-base font-extrabold tracking-tight text-white block leading-tight whitespace-nowrap">
                  PlayStation <span className="text-brand-purpleLight">Manager</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide block uppercase whitespace-nowrap">
                  {t('common.appSubtitle')}
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-midnight-card hover:bg-midnight-hover text-slate-400 hover:text-white border border-midnight-border transition"
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
                      ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple/25'
                      : 'text-slate-400 hover:text-white hover:bg-midnight-card'
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
      <div className="p-3 border-t border-midnight-border space-y-3">
        {/* Language Selector */}
        <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center justify-between'}`}>
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Language
            </span>
          )}
          <LanguageSelector variant="sidebar" />
        </div>

        {/* Admin Profile Box */}
        <div
          className={`p-2.5 rounded-xl bg-midnight-card border border-midnight-border flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {currentUser?.username?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-bold text-white truncate">
                    {currentUser?.username || 'admin'}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded bg-brand-purple/30 text-brand-lavender text-[9px] font-extrabold uppercase">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {currentUser?.fullName || 'Administrator'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-gaming-red hover:bg-gaming-redBg transition"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed view logout button */}
        {isCollapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-gaming-red hover:bg-gaming-redBg border border-transparent hover:border-gaming-red/20 transition"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 border-r border-midnight-border bg-midnight-sidebar ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-midnight-sidebar border-r border-midnight-border z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

