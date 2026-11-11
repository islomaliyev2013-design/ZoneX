import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Tv,
  Users,
  CheckCircle2,
  Grid,
  Plus,
  Pencil,
  Trash2,
  Gamepad2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatters';
import StationCard from '../components/StationCard';
import StartSessionModal from '../components/StartSessionModal';
import FinishSessionModal from '../components/FinishSessionModal';
import AddProductsModal from '../components/AddProductsModal';
import RoomModal from '../components/RoomModal';

export default function Rooms() {
  const {
    rooms = [],
    occupiedStations = [],
    allStations = [],
    occupiedStationsCount = 0,
    availableStationsCount = 0,
    settings = {},
    addStationToRoom,
    removeStationFromRoom,
    deleteRoom,
  } = useApp();
  const { t } = useLanguage();
  const currency = settings?.currency || "so'm";
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter mode: 'by_room' | 'occupied' | 'available'
  const [viewMode, setViewMode] = useState('by_room');

  // Selected room ID, defaults to first room or query param
  const paramRoom = parseInt(searchParams.get('room'), 10);
  const [selectedRoomId, setSelectedRoomId] = useState(paramRoom || (rooms[0]?.id ?? null));

  // Sync selected room if rooms list changes or url param changes
  useEffect(() => {
    if (paramRoom && rooms.some((r) => r.id === paramRoom)) {
      setSelectedRoomId(paramRoom);
    } else if (rooms.length > 0 && !rooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [paramRoom, rooms, selectedRoomId]);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setViewMode('by_room');
    setSearchParams({ room: roomId });
  };

  // Modals state
  const [activeStationForStart, setActiveStationForStart] = useState(null);
  const [activeStationForFinish, setActiveStationForFinish] = useState(null);
  const [activeStationForProducts, setActiveStationForProducts] = useState(null);

  // Room Create/Edit modal state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState('add');
  const [editingRoom, setEditingRoom] = useState(null);

  const handleOpenAddRoom = () => {
    setRoomModalMode('add');
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room) => {
    setRoomModalMode('edit');
    setEditingRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm(t('rooms.confirmDeleteRoom'))) {
      deleteRoom(roomId);
      if (selectedRoomId === roomId) {
        const remaining = rooms.filter((r) => r.id !== roomId);
        if (remaining.length > 0) {
          setSelectedRoomId(remaining[0].id);
          setSearchParams({ room: remaining[0].id });
        } else {
          setSelectedRoomId(null);
          setSearchParams({});
        }
      }
    }
  };

  const handleDeleteStation = (station) => {
    if (window.confirm(t('rooms.confirmDeleteStation'))) {
      removeStationFromRoom(station.roomId, station.id);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  const occupiedInRoom = selectedRoom
    ? (selectedRoom.stations || []).filter((s) => s.status === 'occupied').length
    : 0;
  const availableInRoom = selectedRoom
    ? (selectedRoom.stations || []).length - occupiedInRoom
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('rooms.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {rooms.length} {t('common.roomPrefix')} • {allStations.length} {t('common.stationPrefix')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Filters: By Room vs Only Occupied (Zanyat) vs Free */}
          {rooms.length > 0 && (
            <div className="flex items-center bg-midnight-card p-1 rounded-xl border border-midnight-border">
              <button
                type="button"
                onClick={() => setViewMode('by_room')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'by_room'
                    ? 'bg-brand-purple text-slate-950 font-black shadow-md shadow-brand-purple/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{rooms.length} {t('common.roomPrefix')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('occupied')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'occupied'
                    ? 'bg-gaming-red text-white shadow-md shadow-gaming-red/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>🔴 {occupiedStationsCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('available')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'available'
                    ? 'bg-gaming-green text-white shadow-md shadow-gaming-green/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🟢 {availableStationsCount}</span>
              </button>
            </div>
          )}

          {/* Add New Room Button */}
          <button
            type="button"
            onClick={handleOpenAddRoom}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-cyan-500 hover:from-brand-purpleHover hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('rooms.addRoomBtn')}</span>
          </button>
        </div>
      </div>

      {/* ZERO ROOMS EMPTY STATE */}
      {rooms.length === 0 ? (
        <div className="bg-midnight-card rounded-2xl p-10 sm:p-16 text-center border border-midnight-border shadow-2xl max-w-2xl mx-auto my-6 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-brand-purple/15 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Gamepad2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            {t('rooms.noRoomsTitle')}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            {t('rooms.noRoomsSubtitle')}
          </p>
          <button
            type="button"
            onClick={handleOpenAddRoom}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-purple to-cyan-500 hover:from-brand-purpleHover hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>{t('rooms.addRoomBtn')}</span>
          </button>
        </div>
      ) : (
        <>
          {/* VIEW 1: BY ROOM */}
          {viewMode === 'by_room' && selectedRoom && (
            <>
              {/* Room Cards / Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {rooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  const roomStations = room.stations || [];
                  const occ = roomStations.filter((s) => s.status === 'occupied').length;
                  const free = roomStations.length - occ;

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-midnight-card text-white border-brand-purple shadow-xl ring-2 ring-brand-purple/50 scale-[1.02]'
                          : 'bg-midnight-card/75 text-slate-300 hover:bg-midnight-card hover:text-white border-midnight-border hover:border-brand-purple/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              isSelected
                                ? 'bg-brand-purple text-slate-950 shadow-sm'
                                : 'bg-midnight-bg text-slate-400 border border-midnight-border'
                            }`}
                          >
                            {room.id}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs sm:text-sm text-white block leading-tight truncate">
                              {room.name || `${room.id}-xona`}
                            </span>
                            <span className="text-[10px] font-bold block truncate mt-0.5 text-cyan-400">
                              {room.zoneType || 'Standart'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status breakdown pills */}
                      <div className="flex items-center justify-between gap-1 w-full text-xs font-semibold pt-2 border-t border-midnight-border">
                        <span className="text-gaming-green flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-gaming-green"></span>
                          {free} {t('common.stationPrefix')}
                        </span>
                        {occ > 0 && (
                          <span className="text-gaming-red flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-gaming-red"></span>
                            {occ} band
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Room Stations Container */}
              <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-midnight-border space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-midnight-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-purple/15 text-brand-purpleLight border border-brand-purple/30 flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                      <Tv className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-extrabold text-white">
                          {selectedRoom.name || `${selectedRoom.id}-xona`}
                        </h2>
                        {selectedRoom.zoneType && (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full border bg-cyan-500/15 text-cyan-300 border-cyan-500/40">
                            {selectedRoom.zoneType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedRoom.stations?.length || 0} ta PlayStation konsoli • Tarif:{' '}
                        <span className="text-cyan-300 font-bold">
                          {selectedRoom.isUnlimitedOnly ? (
                            <span>{t('rooms.isUnlimitedLabel')} ({formatCurrency(selectedRoom.hourlyRate || 20000, currency)}/soat)</span>
                          ) : (
                            <span>{formatCurrency(selectedRoom.hourlyRate || 20000, currency)}/soat</span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Room Actions: Add PlayStation Console, Edit Room, Delete Room */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addStationToRoom(selectedRoom.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('rooms.addStationBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditRoom(selectedRoom)}
                      className="p-2 rounded-xl bg-midnight-bg hover:bg-midnight-hover text-slate-300 hover:text-white border border-midnight-border transition cursor-pointer"
                      title={t('rooms.editRoomBtn')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(selectedRoom.id)}
                      className="p-2 rounded-xl bg-midnight-bg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-midnight-border hover:border-rose-500/30 transition cursor-pointer"
                      title={t('rooms.deleteRoomBtn')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stations Grid with items-stretch */}
                {(!selectedRoom.stations || selectedRoom.stations.length === 0) ? (
                  <div className="py-12 px-4 rounded-xl border border-dashed border-midnight-border bg-midnight-bg/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-midnight-card border border-midnight-border text-slate-400 flex items-center justify-center mx-auto">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {t('rooms.noStationsInRoom')}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {t('rooms.noStationsSubtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={() => addStationToRoom(selectedRoom.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('rooms.addStationBtn')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
                    {selectedRoom.stations.map((station) => (
                      <StationCard
                        key={station.id}
                        station={station}
                        onStartClick={(st) => setActiveStationForStart(st)}
                        onFinishClick={(st) => setActiveStationForFinish(st)}
                        onAddProductsClick={(st) => setActiveStationForProducts(st)}
                        onDeleteStationClick={(st) => handleDeleteStation(st)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW 2: ONLY OCCUPIED STATIONS ACROSS ALL ROOMS */}
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
              </div>

              {occupiedStations.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-gaming-green mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-white">
                    {t('occupiedMonitor.noOccupied')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('by_room')}
                    className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-slate-950 text-xs font-black transition cursor-pointer"
                  >
                    {t('rooms.backToRoomsList')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
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

          {/* VIEW 3: ONLY AVAILABLE STATIONS ACROSS ALL ROOMS */}
          {viewMode === 'available' && (
            <div className="bg-midnight-card rounded-2xl p-6 shadow-xl border border-gaming-green/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-midnight-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gaming-greenBg text-gaming-green border border-gaming-green/30 flex items-center justify-center font-extrabold text-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      {t('rooms.freeStationsTitle')}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {t('rooms.freeStationsSubtitle')}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-gaming-greenBg text-gaming-green border border-gaming-green/30 text-xs font-black self-start sm:self-auto">
                  {availableStationsCount} ta bo‘sh
                </span>
              </div>

              {allStations.filter((st) => st.status === 'available').length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-bold text-white mb-1">
                    Barcha konsollar band
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                  {allStations
                    .filter((st) => st.status === 'available')
                    .map((station) => (
                      <StationCard
                        key={station.id}
                        station={station}
                        onStartClick={(st) => setActiveStationForStart(st)}
                        onDeleteStationClick={(st) => handleDeleteStation(st)}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        mode={roomModalMode}
        initialRoom={editingRoom}
      />

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
