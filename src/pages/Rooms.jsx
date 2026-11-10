import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Tv, Users, CheckCircle2, Grid, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import StationCard from '../components/StationCard';
import StartSessionModal from '../components/StartSessionModal';
import FinishSessionModal from '../components/FinishSessionModal';
import AddProductsModal from '../components/AddProductsModal';

export default function Rooms() {
  const {
    rooms,
    occupiedStations = [],
    allStations = [],
    occupiedStationsCount = 0,
    availableStationsCount = 25,
  } = useApp();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter mode: 'by_room' | 'occupied' | 'available'
  const [viewMode, setViewMode] = useState('by_room');

  // Selected room (1 to 5), defaults to 1 or query param
  const paramRoom = parseInt(searchParams.get('room'), 10);
  const initialRoomId = paramRoom >= 1 && paramRoom <= 5 ? paramRoom : 1;
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);

  useEffect(() => {
    if (paramRoom >= 1 && paramRoom <= 5) {
      setSelectedRoomId(paramRoom);
    }
  }, [paramRoom]);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setViewMode('by_room');
    setSearchParams({ room: roomId });
  };

  // Modals state
  const [activeStationForStart, setActiveStationForStart] = useState(null);
  const [activeStationForFinish, setActiveStationForFinish] = useState(null);
  const [activeStationForProducts, setActiveStationForProducts] = useState(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const occupiedInRoom = selectedRoom.stations.filter((s) => s.status === 'occupied').length;
  const availableInRoom = selectedRoom.stations.length - occupiedInRoom;
  const localizedSelectedRoomName = t('rooms.roomN', { n: selectedRoom.id });

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header & View Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('rooms.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('rooms.subtitle')}
          </p>
        </div>

        {/* View Mode Filters: By Room vs Only Occupied (Zanyat) vs Free */}
        <div className="flex items-center bg-midnight-card p-1 rounded-xl border border-midnight-border">
          <button
            type="button"
            onClick={() => setViewMode('by_room')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'by_room'
                ? 'bg-brand-purple text-slate-950 font-black shadow-md shadow-brand-purple/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>5 Xona</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('occupied')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'occupied'
                ? 'bg-gaming-red text-white shadow-md shadow-gaming-red/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>🔴 {t('occupiedMonitor.onlyOccupied', { count: occupiedStationsCount })}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('available')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'available'
                ? 'bg-gaming-green text-white shadow-md shadow-gaming-green/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>🟢 {t('occupiedMonitor.onlyFree', { count: availableStationsCount })}</span>
          </button>

          <Link
            to="/info"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition ml-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>📸 {t('infoPage.galleryTitle') || "Xonalar suratlari"}</span>
          </Link>
        </div>
      </div>

      {/* VIEW 1: BY ROOM (Default 5 Rooms Cards + Selected Room Stations) */}
      {viewMode === 'by_room' && (
        <>
          {/* 5 Room Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              const occupiedCount = room.stations.filter((s) => s.status === 'occupied').length;
              const availableCount = room.stations.length - occupiedCount;
              const roomLabel = t('rooms.roomN', { n: room.id });

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room.id)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-midnight-card text-white border-brand-purple shadow-xl ring-2 ring-brand-purple/50 scale-[1.02]'
                      : 'bg-midnight-card/75 text-slate-300 hover:bg-midnight-card hover:text-white border-midnight-border hover:border-brand-purple/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                          isSelected
                            ? 'bg-brand-purple text-slate-950 shadow-sm'
                            : 'bg-midnight-bg text-slate-400 border border-midnight-border'
                        }`}
                      >
                        {room.id}
                      </div>
                      <span className="font-extrabold text-sm sm:text-base text-white">{roomLabel}</span>
                    </div>
                  </div>

                  {/* Status breakdown pills */}
                  <div className="flex items-center justify-between gap-1 w-full text-xs font-semibold pt-2 border-t border-midnight-border">
                    <span className="text-gaming-green flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gaming-green"></span>
                      {t('rooms.free', { count: availableCount })}
                    </span>
                    <span className="text-gaming-red flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gaming-red"></span>
                      {t('rooms.busy', { count: occupiedCount })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Room Stations View */}
          <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-midnight-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/15 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center font-extrabold text-xl shadow-xs">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">
                    {t('rooms.stationsHeader', { room: localizedSelectedRoomName })}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t('rooms.contains5Consoles')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-gaming-greenBg text-gaming-green border border-gaming-green/30 text-xs font-bold">
                  {t('rooms.availableBadge', { count: availableInRoom })}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-gaming-redBg text-gaming-red border border-gaming-red/30 text-xs font-bold">
                  {t('rooms.occupiedBadge', { count: occupiedInRoom })}
                </div>
              </div>
            </div>

            {/* 5 Stations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {selectedRoom.stations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onStartClick={(st) => setActiveStationForStart(st)}
                  onFinishClick={(st) => setActiveStationForFinish(st)}
                  onAddProductsClick={(st) => setActiveStationForProducts(st)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: ONLY OCCUPIED STATIONS ACROSS ALL 5 ROOMS ("QAYSILARI XONALAR ZANYAT") */}
      {viewMode === 'occupied' && (
        <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-gaming-red/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-midnight-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gaming-redBg text-gaming-red border border-gaming-red/30 flex items-center justify-center font-extrabold text-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {t('occupiedMonitor.title')}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('occupiedMonitor.subtitle')}
                </p>
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-gaming-red text-white text-xs font-black self-start sm:self-auto">
              🔴 {occupiedStations.length} ta konsol band
            </span>
          </div>

          {occupiedStations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-gaming-green" />
              <p className="font-bold text-white text-base">
                {t('occupiedMonitor.noOccupied')}
              </p>
              <button
                type="button"
                onClick={() => setViewMode('by_room')}
                className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-white text-xs font-bold transition"
              >
                Xonalar ro‘yxatiga qaytish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {occupiedStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onFinishClick={(st) => setActiveStationForFinish(st)}
                  onAddProductsClick={(st) => setActiveStationForProducts(st)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: ONLY AVAILABLE STATIONS ACROSS ALL 5 ROOMS */}
      {viewMode === 'available' && (
        <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-gaming-green/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-midnight-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gaming-greenBg text-gaming-green border border-gaming-green/30 flex items-center justify-center font-extrabold text-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Bo‘sh konsollar ro‘yxati
                </h2>
                <p className="text-xs text-slate-400">
                  Mijozlarni qabul qilishga tayyor konsollar
                </p>
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-gaming-greenBg text-gaming-green border border-gaming-green/30 text-xs font-black self-start sm:self-auto">
              🟢 {availableStationsCount} ta konsol bo‘sh
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allStations
              .filter((st) => st.status === 'available')
              .map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onStartClick={(st) => setActiveStationForStart(st)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <StartSessionModal
        key={`start_${activeStationForStart?.id || 'none'}`}
        station={activeStationForStart}
        isOpen={Boolean(activeStationForStart)}
        onClose={() => setActiveStationForStart(null)}
      />

      <FinishSessionModal
        key={`finish_${activeStationForFinish?.id || 'none'}`}
        station={activeStationForFinish}
        isOpen={Boolean(activeStationForFinish)}
        onClose={() => setActiveStationForFinish(null)}
      />

      <AddProductsModal
        key={`prod_${activeStationForProducts?.id || 'none'}`}
        station={activeStationForProducts}
        isOpen={Boolean(activeStationForProducts)}
        onClose={() => setActiveStationForProducts(null)}
      />
    </div>
  );
}
