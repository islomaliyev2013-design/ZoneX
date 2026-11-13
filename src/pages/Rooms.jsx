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
    const stationName = station.stationName
      ? station.stationName.replace(/^Konsol\s*(\d+)$/i, '$1-xona')
      : `${station.stationNumber}-xona`;
    if (window.confirm(`${stationName}ni o‘chirishni tasdiqlaysizmi?`)) {
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
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            {rooms.length} {t('common.roomPrefix')} • {allStations.length} {t('common.stationPrefix')}
          </p>
        </div>

        {rooms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Filters: By Room vs Only Occupied (Zanyat) vs Free */}
            <div className="flex items-center bg-[#1D1B2E] p-1 rounded-xl border border-[rgba(167,139,250,0.15)] shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('by_room')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'by_room'
                    ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                    : 'text-[#A1A1AA] hover:text-white'
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
                    ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                    : 'text-[#A1A1AA] hover:text-white'
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
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(5,150,105,0.4)]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🟢 {availableStationsCount}</span>
              </button>
            </div>

            {/* Add New Room Button */}
            <button
              type="button"
              onClick={handleOpenAddRoom}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.35)] transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('rooms.addRoomBtn')}</span>
            </button>
          </div>
        )}
      </div>

      {/* ZERO ROOMS EMPTY STATE */}
      {rooms.length === 0 ? (
        <div className="bg-[#1D1B2E] rounded-2xl p-10 sm:p-16 text-center border border-[rgba(167,139,250,0.15)] shadow-sm max-w-2xl mx-auto my-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
            {t('rooms.noRoomsTitle')}
          </h2>
          <p className="text-sm text-[#A1A1AA] max-w-md mx-auto mb-6 leading-relaxed">
            {t('rooms.noRoomsSubtitle')}
          </p>
          <button
            type="button"
            onClick={handleOpenAddRoom}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.35)] transition active:scale-95 cursor-pointer"
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
                      className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-150 border flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1D1B2E] text-white border-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.25)] ring-2 ring-[#7C3AED]/30 scale-[1.01]'
                          : 'bg-[#1D1B2E] text-[#A1A1AA] hover:bg-[#25233B] hover:text-white border-[rgba(167,139,250,0.15)] hover:border-[#7C3AED]/40 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-[#7C3AED] text-white shadow-xs'
                                : 'bg-[#101014] text-[#A1A1AA] border border-[rgba(167,139,250,0.15)]'
                            }`}
                          >
                            {room.id}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-white block leading-tight truncate">
                              {room.name ? room.name.replace(/^(\d+)-xona$/i, '$1-PlayStation') : `${room.id}-PlayStation`}
                            </span>
                            <span className="text-[10px] font-semibold block truncate mt-0.5 text-[#A78BFA]">
                              {room.zoneType || 'Standart'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status breakdown pills */}
                      <div className="flex items-center justify-between gap-1 w-full text-xs font-semibold pt-2 border-t border-[rgba(167,139,250,0.15)]">
                        <span className="text-emerald-400 flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {free} {t('common.stationPrefix')}
                        </span>
                        {occ > 0 && (
                          <span className="text-rose-400 flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            {occ} band
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Room Stations Container */}
              <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-[rgba(167,139,250,0.15)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[rgba(167,139,250,0.15)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.25)] flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                      <Tv className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-extrabold text-white">
                          {selectedRoom.name ? selectedRoom.name.replace(/^(\d+)-xona$/i, '$1-PlayStation') : `${selectedRoom.id}-PlayStation`}
                        </h2>
                        {selectedRoom.zoneType && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-[#7C3AED]/20 text-[#A78BFA] border-[rgba(167,139,250,0.25)]">
                            {selectedRoom.zoneType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        {selectedRoom.stations?.length || 0} ta xona • Tarif:{' '}
                        <span className="text-[#A78BFA] font-bold">
                          {selectedRoom.isUnlimitedOnly ? (
                            <span>{t('rooms.isUnlimitedLabel')} ({formatCurrency(selectedRoom.hourlyRate || 20000, currency)}/soat)</span>
                          ) : (
                            <span>{formatCurrency(selectedRoom.hourlyRate || 20000, currency)}/soat</span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Room Actions: Add PlayStation Console, Edit Room */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addStationToRoom(selectedRoom.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition shadow-[0_0_15px_rgba(124,58,237,0.35)] cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('rooms.addStationBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditRoom(selectedRoom)}
                      className="p-2 rounded-xl bg-[#101014] hover:bg-[#25233B] text-[#A1A1AA] hover:text-white border border-[rgba(167,139,250,0.15)] transition cursor-pointer"
                      title={t('rooms.editRoomBtn')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stations Grid with items-stretch */}
                {(!selectedRoom.stations || selectedRoom.stations.length === 0) ? (
                  <div className="py-12 px-4 rounded-xl border border-dashed border-[rgba(167,139,250,0.2)] bg-[#101014] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1D1B2E] border border-[rgba(167,139,250,0.2)] text-[#A1A1AA] flex items-center justify-center mx-auto shadow-xs">
                      <Gamepad2 className="w-6 h-6 text-[#A78BFA]" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {t('rooms.noStationsInRoom')}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                      {t('rooms.noStationsSubtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={() => addStationToRoom(selectedRoom.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs transition cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.35)]"
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
            <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-rose-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[rgba(167,139,250,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-extrabold text-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      {t('occupiedMonitor.title')}
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      {t('occupiedMonitor.subtitle')}
                    </p>
                  </div>
                </div>
              </div>

              {occupiedStations.length === 0 ? (
                <div className="py-12 text-center text-[#A1A1AA] space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-white">
                    {t('occupiedMonitor.noOccupied')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('by_room')}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.35)]"
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
                      onDeleteStationClick={(st) => handleDeleteStation(st)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: ONLY AVAILABLE STATIONS ACROSS ALL ROOMS */}
          {viewMode === 'available' && (
            <div className="bg-[#1D1B2E] rounded-2xl p-6 shadow-sm border border-emerald-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[rgba(167,139,250,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-extrabold text-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      {t('rooms.freeStationsTitle')}
                    </h2>
                    <p className="text-xs text-[#A1A1AA]">
                      {t('rooms.freeStationsSubtitle')}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold self-start sm:self-auto">
                  {availableStationsCount} ta bo‘sh
                </span>
              </div>

              {allStations.filter((st) => st.status === 'available').length === 0 ? (
                <div className="py-12 text-center text-[#A1A1AA]">
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
      <StartSessionModal
        key={`rooms_start_${activeStationForStart?.id || 'none'}`}
        station={activeStationForStart}
        isOpen={Boolean(activeStationForStart)}
        onClose={() => setActiveStationForStart(null)}
      />

      <FinishSessionModal
        key={`rooms_finish_${activeStationForFinish?.id || 'none'}`}
        station={activeStationForFinish}
        isOpen={Boolean(activeStationForFinish)}
        onClose={() => setActiveStationForFinish(null)}
      />

      <AddProductsModal
        key={`rooms_prod_${activeStationForProducts?.id || 'none'}`}
        station={activeStationForProducts}
        isOpen={Boolean(activeStationForProducts)}
        onClose={() => setActiveStationForProducts(null)}
      />

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        mode={roomModalMode}
        initialRoom={editingRoom}
      />
    </div>
  );
}
