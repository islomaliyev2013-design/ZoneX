import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loadRooms,
  saveRooms,
  loadTransactions,
  saveTransactions,
  loadSettings,
  saveSettings,
  INITIAL_ROOMS_COUNT,
  STATIONS_PER_ROOM,
} from '../utils/storage';
import {
  calculateGamingPayment,
  calculateProductTotals,
  calculateTransactionsSummary,
} from '../utils/calculations';
import { toDateKey, formatTimeDisplay } from '../utils/formatters';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const accountId = currentUser?.id || 'account_admin';

  const [rooms, setRooms] = useState(() => loadRooms(accountId));
  const [transactions, setTransactions] = useState(() => loadTransactions(accountId));
  const [settings, setSettings] = useState(() => loadSettings(accountId));

  // Switch data when active user changes
  useEffect(() => {
    setRooms(loadRooms(accountId));
    setTransactions(loadTransactions(accountId));
    setSettings(loadSettings(accountId));
  }, [accountId]);

  // Save changes to localStorage for active account
  useEffect(() => {
    saveRooms(rooms, accountId);
  }, [rooms, accountId]);

  useEffect(() => {
    saveTransactions(transactions, accountId);
  }, [transactions, accountId]);

  useEffect(() => {
    saveSettings(settings, accountId);
  }, [settings, accountId]);

  // Find a station across all rooms
  const findStation = (stationId) => {
    for (const room of rooms) {
      const found = room.stations.find((s) => s.id === stationId);
      if (found) return found;
    }
    return null;
  };

  /**
   * Start a gaming session on an available station
   */
  const startSession = (stationId, { hourlyPrice, customerName }) => {
    const rate = Number(hourlyPrice) || Number(settings.defaultHourlyRate) || 15;
    const now = Date.now();

    setRooms((prevRooms) =>
      prevRooms.map((room) => ({
        ...room,
        stations: room.stations.map((st) => {
          if (st.id === stationId) {
            return {
              ...st,
              status: 'occupied',
              session: {
                id: `sess_${now}_${Math.random().toString(36).substr(2, 5)}`,
                startTime: now,
                hourlyPrice: rate,
                customerName: customerName ? customerName.trim() : '',
                products: [],
              },
            };
          }
          return st;
        }),
      }))
    );
  };

  /**
   * Add products to an ongoing session
   */
  const addProductsToSession = (stationId, newProducts = []) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => ({
        ...room,
        stations: room.stations.map((st) => {
          if (st.id === stationId && st.session) {
            return {
              ...st,
              session: {
                ...st.session,
                products: [...(st.session.products || []), ...newProducts],
              },
            };
          }
          return st;
        }),
      }))
    );
  };

  /**
   * Finish a gaming session, calculate duration & money, save transaction, release station
   */
  const finishSession = (stationId, { finalGamingPayment, finalProducts = [] }) => {
    const station = findStation(stationId);
    if (!station || !station.session) return null;

    const endTime = Date.now();
    const startTime = station.session.startTime;
    const durationMs = Math.max(0, endTime - startTime);

    // Gaming payment
    const autoGaming = calculateGamingPayment(durationMs, station.session.hourlyPrice);
    const gamingPayment =
      finalGamingPayment !== undefined && finalGamingPayment !== ''
        ? Number(finalGamingPayment)
        : autoGaming;

    // Product calculations
    const prodTotals = calculateProductTotals(finalProducts);

    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'session',
      createdAt: endTime,
      dateStr: toDateKey(endTime),
      timeStr: formatTimeDisplay(endTime),
      roomId: station.roomId,
      roomName: station.roomName,
      stationId: station.stationNumber,
      stationName: station.stationName,
      customerName: station.session.customerName || 'Walk-in',
      startTime,
      endTime,
      durationMs,
      hourlyPrice: station.session.hourlyPrice,
      gamingPayment,
      products: finalProducts,
      productRevenue: prodTotals.totalRevenue,
      productCost: prodTotals.totalCost,
      productProfit: prodTotals.totalProfit,
      totalProfit: gamingPayment + prodTotals.totalProfit,
      totalPaid: gamingPayment + prodTotals.totalRevenue,
    };

    // Save transaction
    setTransactions((prev) => [transaction, ...prev]);

    // Reset station
    setRooms((prevRooms) =>
      prevRooms.map((room) => ({
        ...room,
        stations: room.stations.map((st) => {
          if (st.id === stationId) {
            return {
              ...st,
              status: 'available',
              session: null,
            };
          }
          return st;
        }),
      }))
    );

    return transaction;
  };

  /**
   * Record a direct product sale (from Sales page)
   */
  const recordDirectSale = ({ customerName = '', products = [], roomInfo = null }) => {
    if (!products || products.length === 0) return null;

    const now = Date.now();
    const prodTotals = calculateProductTotals(products);

    const transaction = {
      id: `tx_${now}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'product_sale',
      createdAt: now,
      dateStr: toDateKey(now),
      timeStr: formatTimeDisplay(now),
      roomId: roomInfo?.roomId || null,
      roomName: roomInfo?.roomName || 'Direct Sale',
      stationId: roomInfo?.stationNumber || '-',
      stationName: roomInfo?.stationName || '-',
      customerName: customerName ? customerName.trim() : 'Customer',
      startTime: null,
      endTime: now,
      durationMs: 0,
      hourlyPrice: 0,
      gamingPayment: 0,
      products,
      productRevenue: prodTotals.totalRevenue,
      productCost: prodTotals.totalCost,
      productProfit: prodTotals.totalProfit,
      totalProfit: prodTotals.totalProfit,
      totalPaid: prodTotals.totalRevenue,
    };

    setTransactions((prev) => [transaction, ...prev]);
    return transaction;
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Calculations for dashboard
  const allStations = rooms.flatMap((r) => r.stations);
  const totalRooms = INITIAL_ROOMS_COUNT;
  const totalStations = INITIAL_ROOMS_COUNT * STATIONS_PER_ROOM;
  const occupiedStationsCount = allStations.filter((s) => s.status === 'occupied').length;
  const availableStationsCount = totalStations - occupiedStationsCount;

  // Today's stats
  const todayKey = toDateKey(new Date());
  const todayTransactions = transactions.filter((tx) => tx.dateStr === todayKey);
  const todaySummary = calculateTransactionsSummary(todayTransactions);

  return (
    <AppContext.Provider
      value={{
        rooms,
        transactions,
        settings,
        totalRooms,
        totalStations,
        occupiedStationsCount,
        availableStationsCount,
        todayTransactions,
        todaySummary,
        findStation,
        startSession,
        finishSession,
        addProductsToSession,
        recordDirectSale,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
