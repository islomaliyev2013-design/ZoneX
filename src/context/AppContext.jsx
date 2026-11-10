import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadRooms,
  saveRooms,
  loadTransactions,
  saveTransactions,
  loadSettings,
  saveSettings,
  loadProductsCatalog,
  saveProductsCatalog,
  INITIAL_ROOMS_COUNT,
  STATIONS_PER_ROOM,
} from '../utils/storage';
import {
  calculateGamingPayment,
  calculateProductTotals,
  calculateTransactionsSummary,
} from '../utils/calculations';
import { toDateKey, formatTimeDisplay } from '../utils/formatters';
import { stopAlarm } from '../utils/audioAlert';
import { useAuth } from './AuthContext';
import { checkSupabaseConnection, supabase } from '../lib/supabase';
import {
  fetchRoomsStateFromCloud,
  saveRoomsStateToCloud,
  fetchTransactionsFromCloud,
  saveTransactionToCloud,
  fetchSettingsFromCloud,
  saveSettingsToCloud,
} from '../services/supabaseService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  // Unique accountId for each user account.
  // Admin -> 'account_admin'
  // Any newly registered user or other account -> their own unique user ID
  // Guest / unauthenticated -> 'guest'
  const accountId = currentUser?.id ? String(currentUser.id) : 'guest';

  // Using key={accountId} guarantees that whenever a user logs in, logs out, or switches accounts,
  // the entire state (rooms, active sessions, transactions, timers) unmounts cleanly and remounts
  // fresh for that specific account with 0 cross-contamination!
  return (
    <AppInnerProvider key={accountId} accountId={accountId}>
      {children}
    </AppInnerProvider>
  );
}

function AppInnerProvider({ accountId, children }) {
  const [rooms, setRooms] = useState(() => loadRooms(accountId));
  const [transactions, setTransactions] = useState(() => loadTransactions(accountId));
  const [settings, setSettings] = useState(() => loadSettings(accountId));
  const [productsCatalog, setProductsCatalog] = useState(() => loadProductsCatalog(accountId));
  const [cloudStatus, setCloudStatus] = useState('checking'); // 'connected' | 'not_ready' | 'offline' | 'checking'
  const [cloudMessage, setCloudMessage] = useState('');

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

  useEffect(() => {
    saveProductsCatalog(productsCatalog, accountId);
  }, [productsCatalog, accountId]);

  // Check Supabase connection and sync data from Cloud
  useEffect(() => {
    let isMounted = true;

    async function initCloudSync() {
      setCloudStatus('checking');
      const health = await checkSupabaseConnection();

      if (!isMounted) return;

      if (!health.connected) {
        setCloudStatus('offline');
        setCloudMessage(health.error || 'Unable to connect to Supabase');
        return;
      }

      if (!health.tablesReady) {
        setCloudStatus('not_ready');
        setCloudMessage(health.error || 'Database tables not ready');
        return;
      }

      setCloudStatus('connected');
      setCloudMessage('Cloud database synchronized');

      // 1. Sync Rooms from cloud if available
      const cloudRooms = await fetchRoomsStateFromCloud(accountId);
      if (isMounted && Array.isArray(cloudRooms) && cloudRooms.length === INITIAL_ROOMS_COUNT) {
        setRooms(cloudRooms);
        saveRooms(cloudRooms, accountId);
      } else if (isMounted && cloudRooms == null) {
        // Initial sync to cloud
        saveRoomsStateToCloud(accountId, rooms);
      }

      // 2. Sync Transactions from cloud if available
      const cloudTxs = await fetchTransactionsFromCloud(accountId);
      if (isMounted && Array.isArray(cloudTxs)) {
        if (cloudTxs.length > 0) {
          setTransactions(cloudTxs);
          saveTransactions(cloudTxs, accountId);
        } else if (transactions.length > 0) {
          // Upload local transactions to cloud
          transactions.forEach((t) => saveTransactionToCloud(accountId, t));
        }
      }

      // 3. Sync Settings from cloud if available
      const cloudSettings = await fetchSettingsFromCloud(accountId);
      if (isMounted && cloudSettings) {
        setSettings(cloudSettings);
        saveSettings(cloudSettings, accountId);
      } else if (isMounted) {
        saveSettingsToCloud(accountId, settings);
      }
    }

    initCloudSync();

    // Set up Realtime subscription for live room updates across screens
    let channel = null;
    try {
      channel = supabase
        .channel(`rooms_channel_${accountId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rooms_state',
            filter: `account_id=eq.${accountId}`,
          },
          (payload) => {
            if (payload.new?.rooms_data && Array.isArray(payload.new.rooms_data)) {
              setRooms(payload.new.rooms_data);
              saveRooms(payload.new.rooms_data, accountId);
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription not active:', e);
    }

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [accountId]);

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
   * Supports open-ended or timed/prepaid sessions (by budget or duration)
   */
  const startSession = (
    stationId,
    {
      hourlyPrice,
      customerName,
      isTimed = false,
      limitType = 'budget',
      targetDurationMs = 0,
      targetBudget = null,
    } = {}
  ) => {
    stopAlarm(stationId);
    const rate = Number(hourlyPrice) || Number(settings.defaultHourlyRate) || 20000;
    const now = Date.now();
    const durationMs = Number(targetDurationMs) || 0;
    const isSessionTimed = Boolean(isTimed && durationMs > 0);
    const targetEndTime = isSessionTimed ? now + durationMs : null;

    const updatedRooms = rooms.map((room) => ({
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
              isTimed: isSessionTimed,
              limitType,
              targetDurationMs: durationMs,
              targetBudget: targetBudget != null ? Number(targetBudget) : null,
              targetEndTime,
            },
          };
        }
        return st;
      }),
    }));

    setRooms(updatedRooms);
    saveRooms(updatedRooms, accountId);
    saveRoomsStateToCloud(accountId, updatedRooms);
  };

  /**
   * Add products to an ongoing session
   */
  const addProductsToSession = (stationId, newProducts = []) => {
    const updatedRooms = rooms.map((room) => ({
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
    }));

    setRooms(updatedRooms);
    saveRooms(updatedRooms, accountId);
    saveRoomsStateToCloud(accountId, updatedRooms);
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

    const autoGaming = calculateGamingPayment(durationMs, station.session.hourlyPrice);
    const gamingPayment =
      finalGamingPayment !== undefined && finalGamingPayment !== ''
        ? Number(finalGamingPayment)
        : autoGaming;

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

    // Save transaction locally and in cloud
    setTransactions((prev) => [transaction, ...prev]);
    saveTransactionToCloud(accountId, transaction);

    // Reset station and stop any alarm
    stopAlarm(stationId);
    const updatedRooms = rooms.map((room) => ({
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
    }));

    setRooms(updatedRooms);
    saveRooms(updatedRooms, accountId);
    saveRoomsStateToCloud(accountId, updatedRooms);

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
    saveTransactionToCloud(accountId, transaction);
    return transaction;
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettingsToCloud(accountId, updated);
      return updated;
    });
  };

  /**
   * Catalog / Inventory management functions
   */
  const addProductToCatalog = ({ name, purchasePrice, sellingPrice }) => {
    if (!name || !name.trim()) return null;
    const newItem = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
    };
    setProductsCatalog((prev) => {
      const updated = [newItem, ...prev];
      saveProductsCatalog(updated, accountId);
      return updated;
    });
    return newItem;
  };

  const updateProductInCatalog = (id, updatedFields) => {
    setProductsCatalog((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      );
      saveProductsCatalog(updated, accountId);
      return updated;
    });
  };

  const deleteProductFromCatalog = (id) => {
    setProductsCatalog((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveProductsCatalog(updated, accountId);
      return updated;
    });
  };

  const clearTransactions = () => {
    setTransactions([]);
    saveTransactions([], accountId);
  };

  // Calculations for dashboard and quick monitors
  const allStations = rooms.flatMap((r) => r.stations);
  const totalRooms = INITIAL_ROOMS_COUNT;
  const totalStations = INITIAL_ROOMS_COUNT * STATIONS_PER_ROOM;
  const occupiedStations = allStations.filter((s) => s.status === 'occupied');
  const occupiedStationsCount = occupiedStations.length;
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
        productsCatalog,
        addProductToCatalog,
        updateProductInCatalog,
        deleteProductFromCatalog,
        cloudStatus,
        cloudMessage,
        totalRooms,
        totalStations,
        occupiedStations,
        allStations,
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
        clearTransactions,
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
