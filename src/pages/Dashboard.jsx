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
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDurationHuman } from '../utils/formatters';
import StartSessionModal from '../components/StartSessionModal';
import FinishSessionModal from '../components/FinishSessionModal';
import AddProductsModal from '../components/AddProductsModal';
import StationCard from '../components/StationCard';

export default function Dashboard() {
  const {
    rooms = [],
    totalRooms = 0,
    totalStations = 0,
    occupiedStations = [],
    occupiedStationsCount = 0,
    availableStationsCount = 0,
    todaySummary,
    transactions = [],
    settings,
  } = useApp();
  const { t } = useLanguage();

  const currency = settings?.currency || "so'm";

  // Modals state
  const [activeStationForStart, setActiveStationForStart] = useState(null);
  const [activeStationForFinish, setActiveStationForFinish] = useState(null);
  const [activeStationForProducts, setActiveStationForProducts] = useState(null);

  const stats = [
    {
      id: 'rooms',
      label: t('dashboard.totalRooms'),
      value: totalRooms,
      subtext: `${totalRooms} ${t('common.roomPrefix')}`,
      icon: Tv,
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#7C3AED]/20 border-[rgba(167,139,250,0.25)]',
    },
    {
      id: 'stations',
      label: t('dashboard.totalStations'),
      value: totalStations,
      subtext: `${totalStations} ${t('common.stationPrefix')}`,
      icon: Gamepad2,
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#7C3AED]/20 border-[rgba(167,139,250,0.25)]',
    },
    {
      id: 'available',
      label: t('dashboard.availableStations'),
      value: availableStationsCount,
      subtext: t('dashboard.readyForCustomers'),
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
    },
    {
      id: 'occupied',
      label: t('dashboard.occupiedStations'),
      value: occupiedStationsCount,
      subtext: t('dashboard.utilization', {
        percent: totalStations > 0 ? Math.round((occupiedStationsCount / totalStations) * 100) : 0,
      }),
      icon: Users,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/15 border-rose-500/30',
      highlight: occupiedStationsCount > 0,
    },
    {
      id: 'gaming_income',
      label: t('dashboard.todayGamingIncome'),
      value: formatCurrency(todaySummary?.totalGamingIncome || 0, currency),
      subtext: t('dashboard.fromPlaystationSessions'),
      icon: Clock,
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#7C3AED]/20 border-[rgba(167,139,250,0.25)]',
    },
    {
      id: 'product_sales',
      label: t('dashboard.todayProductSales'),
      value: formatCurrency(todaySummary?.totalProductRevenue || 0, currency),
      subtext: t('dashboard.costPrefix', {
        cost: formatCurrency(todaySummary?.totalProductCosts || 0, currency),
      }),
      icon: ShoppingBag,
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#7C3AED]/20 border-[rgba(167,139,250,0.25)]',
    },
    {
      id: 'total_profit',
      label: t('dashboard.todayTotalProfit'),
      value: formatCurrency(todaySummary?.totalProfit || 0, currency),
      subtext: t('dashboard.gamingAndProductProfits'),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      isHero: true,
    },
  ];

  // Recent transactions (real data)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.15)] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-xs font-semibold mb-2 border border-[rgba(167,139,250,0.25)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('dashboard.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 max-w-xl">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-[0_0_15px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Tv className="w-4 h-4" />
            <span>{t('dashboard.manageRooms')}</span>
          </Link>
          <Link
            to="/sales"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#101014] hover:bg-[#25233B] text-white border border-[rgba(167,139,250,0.15)] text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#A78BFA]" />
            <span>{t('dashboard.sellProducts')}</span>
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
              className={`rounded-2xl p-5 shadow-sm border flex flex-col justify-between transition-all duration-150 ${
                isLargeHero
                  ? 'sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#1D1B2E] via-[#1D1B2E] to-[#25233B] border-[rgba(167,139,250,0.3)] shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                  : 'bg-[#1D1B2E] border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <div
                    className={`mt-2 font-black tracking-tight ${
                      isLargeHero
                        ? 'text-3xl sm:text-4xl text-emerald-400'
                        : 'text-2xl sm:text-3xl text-white'
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.bgColor} ${stat.color} shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[rgba(167,139,250,0.15)] flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>{stat.subtext}</span>
                {stat.highlight && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    {t('dashboard.live')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Occupied Consoles Monitor */}
      {occupiedStations.length > 0 && (
        <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-rose-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(167,139,250,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    {t('occupiedMonitor.title')}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)]">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    {occupiedStations.length} {t('dashboard.active')}
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {t('occupiedMonitor.subtitle')}
                </p>
              </div>
            </div>
            <Link
              to="/rooms"
              className="text-xs font-bold text-[#A78BFA] hover:text-white flex items-center gap-1 group"
            >
              <span>{t('dashboard.openFullRoomView')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 items-stretch">
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
      )}

      {/* Live Rooms Overview Card */}
      <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[rgba(167,139,250,0.15)]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-[#A78BFA]" />
              <span>{totalRooms} {t('common.roomPrefix')} • {totalStations} {t('common.stationPrefix')}</span>
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              {t('dashboard.clickStationHint')}
            </p>
          </div>
          <Link
            to="/rooms"
            className="text-xs font-bold text-[#A78BFA] hover:text-white flex items-center gap-1 group"
          >
            <span>{t('dashboard.openFullRoomView')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Dynamic Rooms Grid or Zero Rooms Callout */}
        {rooms.length === 0 ? (
          <div className="py-12 px-4 rounded-xl border border-dashed border-[rgba(167,139,250,0.2)] bg-[#101014] text-center space-y-3 my-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.2)] text-[#A1A1AA] flex items-center justify-center mx-auto shadow-xs">
              <Gamepad2 className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <h3 className="text-base font-bold text-white">
              {t('dashboard.noRoomsNotice')}
            </h3>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs transition cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.35)]"
            >
              <Plus className="w-4 h-4" />
              <span>{t('rooms.addRoomBtn')}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
            {rooms.map((room) => {
              const roomStations = room.stations || [];
              const occupiedInRoom = roomStations.filter((s) => s.status === 'occupied').length;

              return (
                <div
                  key={room.id}
                  className="bg-[#101014] rounded-xl p-4 border border-[rgba(167,139,250,0.15)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="min-w-0 pr-1">
                        <span className="font-extrabold text-sm text-white block leading-tight truncate">
                          {room.name ? room.name.replace(/^(\d+)-xona$/i, '$1-PlayStation') : `${room.id}-PlayStation`}
                        </span>
                        <span className="text-[10px] font-bold block truncate mt-0.5 text-[#A78BFA]">
                          {room.zoneType || 'Standart'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          occupiedInRoom > 0
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {occupiedInRoom} / {roomStations.length} {t('dashboard.active')}
                      </span>
                    </div>

                    {/* Station Mini Rows */}
                    {roomStations.length === 0 ? (
                      <div className="py-4 text-center text-xs text-[#A1A1AA] italic">
                        {t('dashboard.emptyStationsInRoom')}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {roomStations.map((st) => {
                          const isOcc = st.status === 'occupied';
                          const rawStationName = st.stationName || `${st.stationNumber}-xona`;
                          const localizedStationName = rawStationName
                            .replace(/^Konsol\s*(\d+)$/i, '$1-xona')
                            .replace(/^Station\s*(\d+)$/i, '$1-xona');

                          return (
                            <div
                              key={st.id}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between border transition ${
                                isOcc
                                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-200 font-semibold'
                                  : 'bg-[#1D1B2E] border-[rgba(167,139,250,0.15)] text-white hover:border-[#7C3AED]/40'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    isOcc ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                                  }`}
                                />
                                <span className="font-bold truncate text-[11px]">{localizedStationName}</span>
                              </div>

                              {isOcc ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveStationForFinish(st)}
                                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition cursor-pointer"
                                >
                                  {t('dashboard.finish')}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveStationForStart(st)}
                                  className="px-2 py-0.5 rounded bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-bold transition cursor-pointer"
                                >
                                  {t('dashboard.start')}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[rgba(167,139,250,0.15)] text-center">
                    <Link
                      to={`/rooms?room=${room.id}`}
                      className="text-[11px] font-bold text-[#A78BFA] hover:text-white transition"
                    >
                      {t('dashboard.viewRoomStations', { room: room.name ? room.name.replace(/^(\d+)-xona$/i, '$1-PlayStation') : `${room.id}-PlayStation` })}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simple Recent Transactions Section */}
      <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)]">
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(167,139,250,0.15)] mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#A78BFA]" />
            <h3 className="text-base font-bold text-white">{t('dashboard.recentTransactions')}</h3>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-[#A78BFA] hover:text-white flex items-center gap-1 group"
          >
            {t('dashboard.viewAllHistory')}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-[#A1A1AA] text-xs">
            {t('history.noTransactionsFresh')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101014]/60 text-[#A1A1AA] uppercase tracking-wider text-[10px] font-bold border-b border-[rgba(167,139,250,0.15)]">
                <tr>
                  <th className="py-2.5 px-3">{t('dashboard.tableDateTime')}</th>
                  <th className="py-2.5 px-3">{t('dashboard.tableDestination')}</th>
                  <th className="py-2.5 px-3">{t('dashboard.tableGaming')}</th>
                  <th className="py-2.5 px-3">{t('dashboard.tableProducts')}</th>
                  <th className="py-2.5 px-3 text-right">{t('dashboard.tableRevenue')}</th>
                  <th className="py-2.5 px-3 text-right">{t('dashboard.tableProfit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(167,139,250,0.1)] text-white">
                {recentTransactions.map((tx) => {
                  const localizedRoom =
                    tx.roomId != null
                      ? t('rooms.roomN', { n: tx.roomId })
                      : tx.roomName || 'Store';
                  const localizedStation =
                    tx.stationId && tx.stationId !== '-'
                      ? `${t('common.stationPrefix')} ${tx.stationId}`
                      : '';

                  const hasDuration = tx.durationMs > 0;
                  const hasProducts = tx.products && tx.products.length > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-[#25233B]/40 transition">
                      <td className="py-2.5 px-3 font-medium text-white whitespace-nowrap">
                        {tx.dateStr} • {tx.timeStr}
                      </td>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        {localizedRoom} {localizedStation ? `(${localizedStation})` : ''}
                      </td>
                      {/* Gaming Time & Payment */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {hasDuration ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">
                              {formatDurationHuman(tx.durationMs)}
                            </span>
                            <span className="text-[11px] text-[#A1A1AA] font-mono">
                              ({formatCurrency(tx.gamingPayment, currency)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#A1A1AA]">—</span>
                        )}
                      </td>
                      {/* Products Sold */}
                      <td className="py-2.5 px-3 max-w-xs truncate" title={hasProducts ? tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ') : ''}>
                        {hasProducts ? (
                          <div className="truncate">
                            <span className="text-white font-medium">
                              {tx.products.map((p) => `${p.quantity}x ${p.name}`).join(', ')}
                            </span>
                            <span className="text-[#A78BFA] text-[11px] font-bold ml-1.5 font-mono">
                              ({formatCurrency(tx.productRevenue, currency)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#A1A1AA]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                        {formatCurrency(tx.totalPaid || tx.gamingPayment + tx.productRevenue, currency)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400 whitespace-nowrap">
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
