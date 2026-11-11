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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight">
            {t('rooms.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            {rooms.length} {t('common.roomPrefix')} • {allStations.length} {t('common.stationPrefix')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Filters: By Room vs Only Occupied (Zanyat) vs Free */}
          {rooms.length > 0 && (
            <div className="flex items-center bg-white p-1 rounded-xl border border-[#E7E5E4] shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('by_room')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'by_room'
                    ? 'bg-[#0D9488] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#292524]'
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
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#292524]'
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
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#292524]'
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('rooms.addRoomBtn')}</span>
          </button>
        </div>
      </div>

      {/* ZERO ROOMS EMPTY STATE */}
      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-16 text-center border border-[#E7E5E4] shadow-sm max-w-2xl mx-auto my-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#292524] tracking-tight mb-2">
            {t('rooms.noRoomsTitle')}
          </h2>
          <p className="text-sm text-[#78716C] max-w-md mx-auto mb-6 leading-relaxed">
            {t('rooms.noRoomsSubtitle')}
          </p>
          <button
            type="button"
            onClick={handleOpenAddRoom}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
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
                          ? 'bg-white text-[#292524] border-[#0D9488] shadow-sm ring-2 ring-[#0D9488]/30 scale-[1.01]'
                          : 'bg-white text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#292524] border-[#E7E5E4] hover:border-[#0D9488]/30 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-[#0D9488] text-white shadow-xs'
                                : 'bg-[#F5F5F4] text-[#78716C] border border-[#E7E5E4]'
                            }`}
                          >
                            {room.id}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-[#292524] block leading-tight truncate">
                              {room.name ? room.name.replace(/^(\d+)-xona$/i, '$1-PlayStation') : `${room.id}-PlayStation`}
                            </span>
                            <span className="text-[10px] font-semibold block truncate mt-0.5 text-[#0D9488]">
                              {room.zoneType || 'Standart'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status breakdown pills */}
                      <div className="flex items-center justify-between gap-1 w-full text-xs font-semibold pt-2 border-t border-[#E7E5E4]">
                        <span className="text-[#16A34A] flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                          {free} {t('common.stationPrefix')}
                        </span>
                        {occ > 0 && (
                          <span className="text-[#DC2626] flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
                            {occ} band
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Room Stations Container */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E5E4] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E7E5E4]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                      <Tv className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#292524]">
                          {selectedRoom.name ? selectedRoom.name.replace(/^(\d+)-xona$/i, '$1-PlayStation') : `${selectedRoom.id}-PlayStation`}
                        </h2>
                        {selectedRoom.zoneType && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4]/70">
                            {selectedRoom.zoneType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        {selectedRoom.stations?.length || 0} ta xona • Tarif:{' '}
                        <span className="text-[#0D9488] font-bold">
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
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] hover:text-[#0F766E] text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('rooms.addStationBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditRoom(selectedRoom)}
                      className="p-2 rounded-xl bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#78716C] hover:text-[#292524] border border-[#E7E5E4] transition cursor-pointer"
                      title={t('rooms.editRoomBtn')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(selectedRoom.id)}
                      className="p-2 rounded-xl bg-[#F5F5F4] hover:bg-red-50 text-[#78716C] hover:text-[#DC2626] border border-[#E7E5E4] hover:border-red-200 transition cursor-pointer"
                      title={t('rooms.deleteRoomBtn')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stations Grid with items-stretch */}
                {(!selectedRoom.stations || selectedRoom.stations.length === 0) ? (
                  <div className="py-12 px-4 rounded-xl border border-dashed border-[#E7E5E4] bg-[#F5F5F4] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#E7E5E4] text-[#78716C] flex items-center justify-center mx-auto shadow-xs">
                      <Gamepad2 className="w-6 h-6 text-[#0D9488]" />
                    </div>
                    <h3 className="text-base font-bold text-[#292524]">
                      {t('rooms.noStationsInRoom')}
                    </h3>
                    <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                      {t('rooms.noStationsSubtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={() => addStationToRoom(selectedRoom.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition cursor-pointer shadow-sm"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center font-extrabold text-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#292524]">
                      {t('occupiedMonitor.title')}
                    </h2>
                    <p className="text-xs text-[#78716C]">
                      {t('occupiedMonitor.subtitle')}
                    </p>
                  </div>
                </div>
              </div>

              {occupiedStations.length === 0 ? (
                <div className="py-12 text-center text-[#78716C] space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-[#292524]">
                    {t('occupiedMonitor.noOccupied')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('by_room')}
                    className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition cursor-pointer shadow-xs"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center font-extrabold text-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#292524]">
                      {t('rooms.freeStationsTitle')}
                    </h2>
                    <p className="text-xs text-[#78716C]">
                      {t('rooms.freeStationsSubtitle')}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] text-xs font-bold self-start sm:self-auto">
                  {availableStationsCount} ta bo‘sh
                </span>
              </div>

              {allStations.filter((st) => st.status === 'available').length === 0 ? (
                <div className="py-12 text-center text-[#78716C]">
                  <p className="text-sm font-bold text-[#292524] mb-1">
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
