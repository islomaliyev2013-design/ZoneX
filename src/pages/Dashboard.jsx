import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Tv,
  Users,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import StartSessionModal from '../components/StartSessionModal';
import FinishSessionModal from '../components/FinishSessionModal';
import AddProductsModal from '../components/AddProductsModal';

export default function Dashboard() {
  const {
    rooms,
    totalRooms,
    totalStations,
    occupiedStationsCount,
    availableStationsCount,
    todaySummary,
    settings,
  } = useApp();
  const { t } = useLanguage();

  const currency = settings.currency || '$';

  // Modals state
  const [activeStationForStart, setActiveStationForStart] = useState(null);
  const [activeStationForFinish, setActiveStationForFinish] = useState(null);
  const [activeStationForProducts, setActiveStationForProducts] = useState(null);

  const stats = [
    {
      id: 'rooms',
      label: t('dashboard.totalRooms'),
      value: totalRooms,
      subtext: t('dashboard.fiveRoomsSubtext'),
      icon: Tv,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'stations',
      label: t('dashboard.totalStations'),
      value: totalStations,
      subtext: t('dashboard.fivePerRoom'),
      icon: Gamepad2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'occupied',
      label: t('dashboard.occupiedStations'),
      value: occupiedStationsCount,
      subtext: t('dashboard.utilization', {
        percent: Math.round((occupiedStationsCount / totalStations) * 100),
      }),
      icon: Users,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      highlight: occupiedStationsCount > 0,
    },
    {
      id: 'available',
      label: t('dashboard.availableStations'),
      value: availableStationsCount,
      subtext: t('dashboard.readyForCustomers'),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'gaming_income',
      label: t('dashboard.todayGamingIncome'),
      value: formatCurrency(todaySummary.totalGamingIncome, currency),
      subtext: t('dashboard.fromPlaystationSessions'),
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'product_sales',
      label: t('dashboard.todayProductSales'),
      value: formatCurrency(todaySummary.totalProductRevenue, currency),
      subtext: t('dashboard.costPrefix', {
        cost: formatCurrency(todaySummary.totalProductCosts, currency),
      }),
      icon: ShoppingBag,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'total_profit',
      label: t('dashboard.todayTotalProfit'),
      value: formatCurrency(todaySummary.totalProfit, currency),
      subtext: t('dashboard.gamingAndProductProfits'),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      isHero: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition"
          >
            <Tv className="w-4 h-4" />
            {t('dashboard.manageRooms')}
          </Link>
          <Link
            to="/sales"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-sm font-bold transition"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            {t('dashboard.sellProducts')}
          </Link>
        </div>
      </div>

      {/* 7 Required Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isLargeHero = stat.isHero;
          return (
            <div
              key={stat.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between transition-transform hover:-translate-y-0.5 ${
                isLargeHero
                  ? 'sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-white via-white to-emerald-50/50 ring-2 ring-emerald-500/20'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <div
                    className={`mt-2 font-black tracking-tight text-slate-900 ${
                      isLargeHero ? 'text-3xl sm:text-4xl text-emerald-600' : 'text-2xl sm:text-3xl'
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{stat.subtext}</span>
                {stat.highlight && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    {t('dashboard.live')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live 5 Rooms At-A-Glance Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Tv className="w-5 h-5 text-blue-600" />
              {t('dashboard.liveRoomOverview')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('dashboard.clickStationHint')}
            </p>
          </div>
          <Link
            to="/rooms"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            {t('dashboard.openFullRoomView')}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 5 Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {rooms.map((room) => {
            const occupiedInRoom = room.stations.filter((s) => s.status === 'occupied').length;
            const localizedRoomName = t('rooms.roomN', { n: room.id });

            return (
              <div
                key={room.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-sm text-slate-900">{localizedRoomName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        occupiedInRoom > 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {occupiedInRoom} / 5 {t('dashboard.active')}
                    </span>
                  </div>

                  {/* 5 mini station rows */}
                  <div className="space-y-1.5">
                    {room.stations.map((st) => {
                      const isOcc = st.status === 'occupied';
                      const localizedStationName = `${t('common.stationPrefix')} ${st.stationNumber}`;

                      return (
                        <div
                          key={st.id}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between border transition ${
                            isOcc
                              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                              : 'bg-white border-slate-200/70 text-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                isOcc ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                              }`}
                            />
                            <span className="font-bold truncate">{localizedStationName}</span>
                          </div>

                          {isOcc ? (
                            <button
                              type="button"
                              onClick={() => setActiveStationForFinish(st)}
                              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs transition"
                            >
                              {t('dashboard.finish')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveStationForStart(st)}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition"
                            >
                              {t('dashboard.start')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
                  <Link
                    to={`/rooms?room=${room.id}`}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    {t('dashboard.viewRoomStations', { room: localizedRoomName })}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <StartSessionModal
        station={activeStationForStart}
        isOpen={Boolean(activeStationForStart)}
        onClose={() => setActiveStationForStart(null)}
      />

      <FinishSessionModal
        station={activeStationForFinish}
        isOpen={Boolean(activeStationForFinish)}
        onClose={() => setActiveStationForFinish(null)}
      />

      <AddProductsModal
        station={activeStationForProducts}
        isOpen={Boolean(activeStationForProducts)}
        onClose={() => setActiveStationForProducts(null)}
      />
    </div>
  );
}
