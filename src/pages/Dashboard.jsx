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
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDurationHuman, formatDateDisplay } from '../utils/formatters';
import StartSessionModal from '../components/StartSessionModal';
import FinishSessionModal from '../components/FinishSessionModal';
import AddProductsModal from '../components/AddProductsModal';
import StationCard from '../components/StationCard';

export default function Dashboard() {
  const {
    rooms,
    totalRooms,
    totalStations,
    occupiedStations = [],
    occupiedStationsCount,
    availableStationsCount,
    todaySummary,
    transactions,
    settings,
  } = useApp();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const currency = settings.currency || "so'm";

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
      color: 'text-brand-purpleLight',
      bgColor: 'bg-brand-purple/15 border-brand-purple/30',
    },
    {
      id: 'stations',
      label: t('dashboard.totalStations'),
      value: totalStations,
      subtext: t('dashboard.fivePerRoom'),
      icon: Gamepad2,
      color: 'text-brand-lavender',
      bgColor: 'bg-brand-purple/15 border-brand-purple/30',
    },
    {
      id: 'available',
      label: t('dashboard.availableStations'),
      value: availableStationsCount,
      subtext: t('dashboard.readyForCustomers'),
      icon: CheckCircle2,
      color: 'text-gaming-green',
      bgColor: 'bg-gaming-greenBg border-gaming-green/30',
    },
    {
      id: 'occupied',
      label: t('dashboard.occupiedStations'),
      value: occupiedStationsCount,
      subtext: t('dashboard.utilization', {
        percent: Math.round((occupiedStationsCount / totalStations) * 100),
      }),
      icon: Users,
      color: 'text-gaming-red',
      bgColor: 'bg-gaming-redBg border-gaming-red/30',
      highlight: occupiedStationsCount > 0,
    },
    {
      id: 'gaming_income',
      label: t('dashboard.todayGamingIncome'),
      value: formatCurrency(todaySummary.totalGamingIncome, currency),
      subtext: t('dashboard.fromPlaystationSessions'),
      icon: Clock,
      color: 'text-brand-purpleLight',
      bgColor: 'bg-brand-purple/15 border-brand-purple/30',
    },
    {
      id: 'product_sales',
      label: t('dashboard.todayProductSales'),
      value: formatCurrency(todaySummary.totalProductRevenue, currency),
      subtext: t('dashboard.costPrefix', {
        cost: formatCurrency(todaySummary.totalProductCosts, currency),
      }),
      icon: ShoppingBag,
      color: 'text-brand-lavender',
      bgColor: 'bg-brand-purple/15 border-brand-purple/30',
    },
    {
      id: 'total_profit',
      label: t('dashboard.todayTotalProfit'),
      value: formatCurrency(todaySummary.totalProfit, currency),
      subtext: t('dashboard.gamingAndProductProfits'),
      icon: TrendingUp,
      color: 'text-gaming-green',
      bgColor: 'bg-gaming-greenBg border-gaming-green/30',
      isHero: true,
    },
  ];

  // Recent transactions (real data)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-midnight-card border border-midnight-border shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-purpleLight text-xs font-semibold mb-2 border border-brand-purple/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gaming Business Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-slate-950 text-xs font-black shadow-md shadow-brand-purple/30 transition hover:-translate-y-0.5 active:translate-y-0"
          >
            <Tv className="w-4 h-4" />
            {t('dashboard.manageRooms')}
          </Link>
          <Link
            to="/sales"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-midnight-bg hover:bg-midnight-hover text-slate-200 border border-midnight-border text-xs font-bold transition"
          >
            <ShoppingBag className="w-4 h-4 text-brand-purpleLight" />
            {t('dashboard.sellProducts')}
          </Link>
        </div>
      </div>

      {/* 7 Required Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isLargeHero = stat.isHero;
          return (
            <div
              key={stat.id}
              className={`bg-midnight-card rounded-2xl p-5 shadow-lg border border-midnight-border flex flex-col justify-between transition-all duration-200 hover:border-brand-purple/40 ${
                isLargeHero
                  ? 'sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-midnight-card via-midnight-card to-brand-purple/10 border-brand-purple/40'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <div
                    className={`mt-2 font-black tracking-tight text-white ${
                      isLargeHero
                        ? 'text-3xl sm:text-4xl text-gaming-green'
                        : 'text-2xl sm:text-3xl'
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.bgColor} ${stat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-midnight-border flex items-center justify-between text-xs text-slate-400">
                <span>{stat.subtext}</span>
                {stat.highlight && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gaming-redBg text-gaming-red border border-gaming-red/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-gaming-red animate-ping" />
                    {t('dashboard.live')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Occupied Consoles Monitor ("Qaysilari xonalar zanyat") */}
      {occupiedStations.length > 0 ? (
        <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-gaming-red/40 bg-gradient-to-br from-midnight-card via-midnight-card to-gaming-red/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-midnight-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gaming-redBg text-gaming-red border border-gaming-red/30 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    {t('occupiedMonitor.title')}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-gaming-red text-white">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    {occupiedStations.length} {t('dashboard.active')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('occupiedMonitor.subtitle')}
                </p>
              </div>
            </div>
            <Link
              to="/rooms"
              className="text-xs font-bold text-brand-purpleLight hover:text-white flex items-center gap-1 group"
            >
              <span>{t('dashboard.openFullRoomView')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {occupiedStations.map((st) => (
              <StationCard
                key={st.id}
                station={st}
                onFinishClick={setActiveStationForFinish}
                onAddProductsClick={setActiveStationForProducts}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-midnight-card rounded-2xl p-4 sm:p-5 shadow-sm border border-midnight-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gaming-greenBg text-gaming-green border border-gaming-green/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {t('occupiedMonitor.noOccupied')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {totalStations} ta konsoldan barchasi bo‘sh • {totalRooms} ta xona faol
              </p>
            </div>
          </div>
          <Link
            to="/rooms"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-purple/20 text-brand-purpleLight hover:bg-brand-purple hover:text-white text-xs font-bold transition"
          >
            <span>{t('dashboard.manageRooms')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Club Rooms Atmosphere & Photo Gallery Preview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#142033] to-[#0D1524] border border-[#25364C] shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Klub Atmosferasi & Jihozlar</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            Xonalar Ko‘rinishi va Real Suratlari
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            The Platform zali, 4K ekranli Game Zone, Neon Pulse lounge va VIP kabina holatini tiniq fotogalereyada ko‘ring.
          </p>
          <Link
            to="/info"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm"
          >
            <span>Fotogalereya va ma'lumotlar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Small Photo Thumbnails */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {[
            { img: '/gallery/room-platform.jpg', label: 'The Platform' },
            { img: '/gallery/room-gamezone.jpg', label: 'Game Zone' },
            { img: '/gallery/room-neon.jpg', label: 'Neon Lounge' },
            { img: '/gallery/room-vip.jpg', label: 'VIP Kabina' },
          ].map((item, idx) => (
            <Link
              key={idx}
              to="/info"
              className="group relative w-full sm:w-32 lg:w-36 h-24 rounded-2xl overflow-hidden border border-[#25364C] hover:border-cyan-400/80 transition shadow-md"
            >
              <img
                src={item.img}
                alt={item.label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-bold text-white leading-tight">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live 5 Rooms Overview Card */}
      <div className="bg-midnight-card rounded-2xl p-6 shadow-lg border border-midnight-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-midnight-border">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-brand-purpleLight" />
              {t('dashboard.liveRoomOverview')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('dashboard.clickStationHint')}
            </p>
          </div>
          <Link
            to="/rooms"
            className="text-xs font-bold text-brand-purpleLight hover:text-white flex items-center gap-1 group"
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
                className="bg-midnight-bg rounded-xl p-4 border border-midnight-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-sm text-white">{localizedRoomName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        occupiedInRoom > 0
                          ? 'bg-gaming-redBg text-gaming-red border-gaming-red/30'
                          : 'bg-gaming-greenBg text-gaming-green border-gaming-green/30'
                      }`}
                    >
                      {occupiedInRoom} / 5 {t('dashboard.active')}
                    </span>
                  </div>

                  {/* 5 Station Mini Rows */}
                  <div className="space-y-1.5">
                    {room.stations.map((st) => {
                      const isOcc = st.status === 'occupied';
                      const localizedStationName = `${t('common.stationPrefix')} ${st.stationNumber}`;

                      return (
                        <div
                          key={st.id}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between border transition ${
                            isOcc
                              ? 'bg-gaming-redBg/60 border-gaming-red/30 text-rose-200'
                              : 'bg-midnight-card border-midnight-border text-slate-300 hover:border-brand-purple/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                isOcc ? 'bg-gaming-red animate-pulse' : 'bg-gaming-green'
                              }`}
                            />
                            <span className="font-bold truncate text-[11px]">{localizedStationName}</span>
                          </div>

                          {isOcc ? (
                            <button
                              type="button"
                              onClick={() => setActiveStationForFinish(st)}
                              className="px-2 py-0.5 rounded bg-gaming-red hover:bg-rose-600 text-white text-[10px] font-bold transition"
                            >
                              {t('dashboard.finish')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveStationForStart(st)}
                              className="px-2 py-0.5 rounded bg-brand-purple hover:bg-brand-purpleHover text-white text-[10px] font-bold transition"
                            >
                              {t('dashboard.start')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-midnight-border text-center">
                  <Link
                    to={`/rooms?room=${room.id}`}
                    className="text-[11px] font-bold text-brand-purpleLight hover:text-brand-lavender transition"
                  >
                    {t('dashboard.viewRoomStations', { room: localizedRoomName })}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Recent Transactions Section (Real Data) */}
      <div className="bg-midnight-card rounded-2xl p-6 shadow-lg border border-midnight-border">
        <div className="flex items-center justify-between pb-4 border-b border-midnight-border mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-purpleLight" />
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-brand-purpleLight hover:text-white flex items-center gap-1 group"
          >
            View All History
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {t('history.noTransactionsFresh')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight-bg text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-midnight-border">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Duration / Items</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-border text-slate-300">
                {recentTransactions.map((tx) => {
                  const localizedRoom =
                    tx.roomId != null
                      ? t('rooms.roomN', { n: tx.roomId })
                      : tx.roomName || 'Store';
                  const localizedStation =
                    tx.stationId && tx.stationId !== '-'
                      ? `${t('common.stationPrefix')} ${tx.stationId}`
                      : '';

                  return (
                    <tr key={tx.id} className="hover:bg-midnight-bg/60 transition">
                      <td className="py-2.5 px-3 font-medium text-white">
                        {tx.dateStr} • {tx.timeStr}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        {localizedRoom} {localizedStation ? `(${localizedStation})` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {tx.durationMs > 0
                          ? formatDurationHuman(tx.durationMs)
                          : tx.products?.map((p) => `${p.quantity}x ${p.name}`).join(', ') || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {formatCurrency(tx.totalPaid || tx.gamingPayment + tx.productRevenue, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-gaming-green">
                        {formatCurrency(tx.totalProfit, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <StartSessionModal
        key={`dash_start_${activeStationForStart?.id || 'none'}`}
        station={activeStationForStart}
        isOpen={Boolean(activeStationForStart)}
        onClose={() => setActiveStationForStart(null)}
      />

      <FinishSessionModal
        key={`dash_finish_${activeStationForFinish?.id || 'none'}`}
        station={activeStationForFinish}
        isOpen={Boolean(activeStationForFinish)}
        onClose={() => setActiveStationForFinish(null)}
      />

      <AddProductsModal
        key={`dash_prod_${activeStationForProducts?.id || 'none'}`}
        station={activeStationForProducts}
        isOpen={Boolean(activeStationForProducts)}
        onClose={() => setActiveStationForProducts(null)}
      />
    </div>
  );
}
