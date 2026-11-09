import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tv } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import StationCard from '../components/StationCard';
import StartSessionModal from '../components/StartSessionModal';
import FinishSessionModal from '../components/FinishSessionModal';
import AddProductsModal from '../components/AddProductsModal';

export default function Rooms() {
  const { rooms } = useApp();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected room (1 to 5), defaults to 1 or query param
  const paramRoom = parseInt(searchParams.get('room'), 10);
  const initialRoomId = paramRoom >= 1 && paramRoom <= 5 ? paramRoom : 1;
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);

  // Sync when param changes
  useEffect(() => {
    if (paramRoom >= 1 && paramRoom <= 5) {
      setSelectedRoomId(paramRoom);
    }
  }, [paramRoom]);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
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
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('rooms.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t('rooms.subtitle')}
        </p>
      </div>

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
                  ? 'bg-white text-slate-900 border-blue-500 shadow-lg ring-2 ring-blue-500 scale-[1.02]'
                  : 'bg-white/95 text-slate-700 hover:bg-white border-transparent hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {room.id}
                  </div>
                  <span className="font-extrabold text-base text-slate-900">{roomLabel}</span>
                </div>
              </div>

              {/* Status breakdown pills */}
              <div className="flex items-center justify-between gap-1 w-full text-xs font-semibold pt-2 border-t border-slate-100">
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {t('rooms.free', { count: availableCount })}
                </span>
                <span className="text-rose-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  {t('rooms.busy', { count: occupiedCount })}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Room Stations View */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        
        {/* Room Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {t('rooms.stationsHeader', { room: localizedSelectedRoomName })}
              </h2>
              <p className="text-xs text-slate-500">
                {t('rooms.contains5Consoles')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              {t('rooms.availableBadge', { count: availableInRoom })}
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
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
