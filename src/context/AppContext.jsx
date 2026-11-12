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
  loadDebts,
  saveDebts,
  loadClickPayments,
  saveClickPayments,
  createRoomObject,
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
  const [debts, setDebts] = useState(() => loadDebts(accountId));
  const [clickPayments, setClickPayments] = useState(() => loadClickPayments(accountId));
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

  useEffect(() => {
    saveDebts(debts, accountId);
  }, [debts, accountId]);

  useEffect(() => {
    saveClickPayments(clickPayments, accountId);
  }, [clickPayments, accountId]);

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
      if (isMounted && Array.isArray(cloudRooms)) {
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

    return () => {
      isMounted = false;
    };
  }, [accountId]);

  // Real-time listener for multi-device sync
  useEffect(() => {
    const channel = supabase
      .channel(`public:rooms_state:${accountId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms_state',
          filter: `account_id=eq.${accountId}`,
        },
        (payload) => {
          if (payload.new && Array.isArray(payload.new.rooms_data)) {
            setRooms(payload.new.rooms_data);
            saveRooms(payload.new.rooms_data, accountId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId]);

  // Helper to find a station across all rooms
  const findStation = useCallback(
    (stationId) => {
      for (const room of rooms) {
        const found = (room.stations || []).find((s) => s.id === stationId);
        if (found) return found;
      }
      return null;
    },
    [rooms]
  );

  /**
   * DYNAMIC ROOM MANAGEMENT:
   * addRoom, updateRoom, deleteRoom, addStationToRoom, removeStationFromRoom
   */
  const addRoom = ({
    name,
    zoneType = 'Standart Zal',
    hourlyRate = 20000,
    isUnlimitedOnly = false,
    stationCount = 0,
  }) => {
    const nextId =
      rooms.length > 0 ? Math.max(...rooms.map((r) => Number(r.id) || 0)) + 1 : 1;
    const roomName = name?.trim() || `${nextId}-PlayStation`;
    const newRoom = createRoomObject({
      id: nextId,
      name: roomName,
      zoneName: roomName,
      zoneType: zoneType || 'Standart Zal',
      hourlyRate: Number(hourlyRate) || 20000,
      isUnlimitedOnly: Boolean(isUnlimitedOnly),
      stationCount: Number(stationCount) || 0,
    });

    const updated = [...rooms, newRoom];
    setRooms(updated);
    saveRooms(updated, accountId);
    saveRoomsStateToCloud(accountId, updated);
    return newRoom;
  };

  const updateRoom = (roomId, updates) => {
    const updated = rooms.map((room) => {
      if (room.id === roomId) {
        const newName = updates.name !== undefined ? updates.name.trim() : room.name;
        const newZoneType = updates.zoneType !== undefined ? updates.zoneType : room.zoneType;
        const newRate =
          updates.hourlyRate !== undefined ? Number(updates.hourlyRate) || 20000 : room.hourlyRate;
        const newUnlimited =
          updates.isUnlimitedOnly !== undefined
            ? Boolean(updates.isUnlimitedOnly)
            : room.isUnlimitedOnly;

        const updatedStations = (room.stations || []).map((st) => ({
          ...st,
          roomName: newName,
          zoneName: newName,
          zoneType: newZoneType,
          hourlyRate: newRate,
          isUnlimitedOnly: newUnlimited,
          session: st.session
            ? {
                ...st.session,
                hourlyPrice: newRate,
              }
            : null,
        }));

        return {
          ...room,
          name: newName,
          zoneName: newName,
          zoneType: newZoneType,
          hourlyRate: newRate,
          isUnlimitedOnly: newUnlimited,
          stations: updatedStations,
        };
      }
      return room;
    });

    setRooms(updated);
    saveRooms(updated, accountId);
    saveRoomsStateToCloud(accountId, updated);
  };

  const deleteRoom = (roomId) => {
    // Stop alarms for all stations in this room
    const target = rooms.find((r) => r.id === roomId);
    if (target?.stations) {
      target.stations.forEach((st) => stopAlarm(st.id));
    }

    const updated = rooms.filter((r) => r.id !== roomId);
    setRooms(updated);
    saveRooms(updated, accountId);
    saveRoomsStateToCloud(accountId, updated);
  };

  const addStationToRoom = (roomId, customName) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return null;

    const existingStations = targetRoom.stations || [];
    const nextNumber =
      existingStations.length > 0
        ? Math.max(...existingStations.map((s) => Number(s.stationNumber) || 0)) + 1
        : 1;

    const stationName = customName?.trim() || `${nextNumber}-xona`;
    const newStation = {
      id: `r${roomId}-s${Date.now().toString(36)}_${nextNumber}`,
      roomId,
      roomName: targetRoom.name,
      zoneName: targetRoom.zoneName || targetRoom.name,
      zoneType: targetRoom.zoneType || 'Standart Zal',
      stationNumber: nextNumber,
      stationName,
      hourlyRate: targetRoom.hourlyRate || 20000,
      isUnlimitedOnly: Boolean(targetRoom.isUnlimitedOnly),
      status: 'available',
      session: null,
    };

    const updated = rooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,
          stations: [...(room.stations || []), newStation],
        };
      }
      return room;
    });

    setRooms(updated);
    saveRooms(updated, accountId);
    saveRoomsStateToCloud(accountId, updated);
    return newStation;
  };

  const removeStationFromRoom = (roomId, stationId) => {
    stopAlarm(stationId);
    const updated = rooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,
          stations: (room.stations || []).filter((st) => st.id !== stationId),
        };
      }
      return room;
    });

    setRooms(updated);
    saveRooms(updated, accountId);
    saveRoomsStateToCloud(accountId, updated);
  };

  /**
   * Start a gaming session
   */
  const startSession = (stationId, sessionConfig) => {
    const {
      hourlyPrice,
      customerName = '',
      isTimed = false,
      targetDurationMs = null,
      targetBudget = null,
      initialProducts = [],
    } = sessionConfig;

    const now = Date.now();
    const targetEndTime = isTimed && targetDurationMs ? now + targetDurationMs : null;

    const updatedRooms = rooms.map((room) => ({
      ...room,
      stations: (room.stations || []).map((st) => {
        if (st.id === stationId) {
          return {
            ...st,
            status: 'occupied',
            session: {
              id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              startTime: now,
              hourlyPrice: Number(hourlyPrice) || st.hourlyRate || settings.defaultHourlyRate || 20000,
              customerName: customerName.trim() || 'Walk-in',
              isTimed: Boolean(isTimed),
              targetDurationMs: isTimed ? targetDurationMs : null,
              targetBudget: isTimed ? targetBudget : null,
              targetEndTime,
              products: initialProducts || [],
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
   * Add products directly into an active session
   */
  const addProductsToSession = (stationId, newProducts) => {
    if (!newProducts || newProducts.length === 0) return;

    const updatedRooms = rooms.map((room) => ({
      ...room,
      stations: (room.stations || []).map((st) => {
        if (st.id === stationId && st.session) {
          const currentProducts = st.session.products || [];
          return {
            ...st,
            session: {
              ...st.session,
              products: [...currentProducts, ...newProducts],
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
   * Finish session and create transaction record
   */
  const finishSession = (
    stationId,
    { finalGamingPayment, finalProducts = [], paymentMethod = 'cash', transactionRef = '' }
  ) => {
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
    const totalAmount = gamingPayment + prodTotals.totalRevenue;

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
      totalPaid: totalAmount,
      paymentMethod: paymentMethod || 'cash',
      transactionRef: transactionRef || '',
    };

    // If paid via Click, automatically record in Click payments
    if (paymentMethod === 'click') {
      addClickPayment({
        customerName: station.session.customerName || 'Walk-in',
        roomStation: `${station.roomName || 'PlayStation'} - ${station.stationName || 'Xona'}`,
        amount: totalAmount,
        purpose: 'session',
        purposeLabel: `${station.roomName || 'PlayStation'} - ${station.stationName || 'Xona'}`,
        transactionRef,
        dateStr: toDateKey(endTime),
        timeStr: formatTimeDisplay(endTime),
        createdAt: endTime,
        status: 'completed',
        notes: `PlayStation seansi (${formatTimeDisplay(endTime)})`,
      });
    }

    // Save transaction locally and in cloud
    setTransactions((prev) => [transaction, ...prev]);
    saveTransactionToCloud(accountId, transaction);

    // Reset station and stop any alarm
    stopAlarm(stationId);
    const updatedRooms = rooms.map((room) => ({
      ...room,
      stations: (room.stations || []).map((st) => {
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

  /**
   * Debts Management
   */
  const addDebt = (debtData) => {
    const now = new Date();
    const newDebt = {
      id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      customerName: debtData.customerName?.trim() || 'Nomsiz',
      phone: debtData.phone?.trim() || '',
      roomStation: debtData.roomStation?.trim() || '',
      gameplayAmount: Number(debtData.gameplayAmount) || 0,
      products: Array.isArray(debtData.products) ? debtData.products : [],
      productsAmount: Number(debtData.productsAmount) || 0,
      totalDebt:
        debtData.totalDebt != null
          ? Number(debtData.totalDebt)
          : (Number(debtData.gameplayAmount) || 0) + (Number(debtData.productsAmount) || 0),
      dateStr: debtData.dateStr || toDateKey(now),
      timeStr: debtData.timeStr || formatTimeDisplay(now),
      createdAt: debtData.createdAt || Date.now(),
      status: debtData.status || 'unpaid', // 'unpaid' | 'paid'
      paidAt: debtData.paidAt || null,
      notes: debtData.notes?.trim() || '',
    };
    setDebts((prev) => {
      const updated = [newDebt, ...prev];
      saveDebts(updated, accountId);
      return updated;
    });
    return newDebt;
  };

  const updateDebt = (debtId, updates) => {
    setDebts((prev) => {
      const updated = prev.map((d) => {
        if (d.id !== debtId) return d;
        const next = { ...d, ...updates };
        if (updates.gameplayAmount !== undefined || updates.productsAmount !== undefined) {
          const gp = updates.gameplayAmount !== undefined ? Number(updates.gameplayAmount) || 0 : d.gameplayAmount;
          const pa = updates.productsAmount !== undefined ? Number(updates.productsAmount) || 0 : d.productsAmount;
          if (updates.totalDebt === undefined) {
            next.totalDebt = gp + pa;
          }
        }
        return next;
      });
      saveDebts(updated, accountId);
      return updated;
    });
  };

  const deleteDebt = (debtId) => {
    setDebts((prev) => {
      const updated = prev.filter((d) => d.id !== debtId);
      saveDebts(updated, accountId);
      return updated;
    });
  };

  const markDebtAsPaid = (debtId) => {
    setDebts((prev) => {
      const updated = prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              status: 'paid',
              paidAt: Date.now(),
            }
          : d
      );
      saveDebts(updated, accountId);
      return updated;
    });
  };

  const finishSessionAsDebt = (stationId, debtDetails = {}) => {
    const station = findStation(stationId);
    if (!station || !station.session) return null;

    const session = station.session;
    const now = Date.now();
    const nowDate = new Date(now);
    const dateStr = toDateKey(nowDate);
    const timeStr = formatTimeDisplay(nowDate);

    // 1. Calculate gaming charge
    const gamingAmount =
      debtDetails.finalGamingPayment !== undefined
        ? Number(debtDetails.finalGamingPayment)
        : calculateGamingPayment(now - session.startTime, session.hourlyPrice);

    // 2. Products
    const finalProducts = debtDetails.finalProducts || session.products || [];
    const validProducts = finalProducts.filter(
      (p) => p.name && p.name.trim() !== '' && Number(p.quantity) > 0
    );
    const productTotals = calculateProductTotals(validProducts);

    const totalDebt = gamingAmount + productTotals.totalRevenue;

    // 3. Create debt record
    const newDebt = addDebt({
      customerName: debtDetails.customerName || session.customerName || 'Nomsiz',
      phone: debtDetails.phone || '',
      roomStation: `${station.roomName || 'PlayStation'} - ${station.stationName || 'Xona'}`,
      gameplayAmount: gamingAmount,
      products: validProducts,
      productsAmount: productTotals.totalRevenue,
      totalDebt,
      dateStr,
      timeStr,
      createdAt: now,
      status: 'unpaid',
      notes: debtDetails.notes || '',
    });

    // 4. Reset station to available (stopping any alarm)
    stopAlarm(stationId);
    setRooms((prevRooms) => {
      const updated = prevRooms.map((room) => {
        if (room.id !== station.roomId) return room;
        return {
          ...room,
          stations: (room.stations || []).map((s) => {
            if (s.id !== stationId) return s;
            return {
              ...s,
              status: 'available',
              session: null,
            };
          }),
        };
      });
      saveRoomsStateToCloud(accountId, updated);
      return updated;
    });

    return newDebt;
  };

  /**
   * Click Payments Management
   */
  const addClickPayment = (paymentData) => {
    const now = new Date();
    const newPayment = {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      customerName: paymentData.customerName?.trim() || 'Mijoz',
      phone: paymentData.phone?.trim() || '',
      roomStation: paymentData.roomStation?.trim() || '',
      amount: Number(paymentData.amount) || 0,
      purpose: paymentData.purpose || 'session',
      purposeLabel: paymentData.purposeLabel?.trim() || '',
      transactionRef: paymentData.transactionRef?.trim() || '',
      dateStr: paymentData.dateStr || toDateKey(now),
      timeStr: paymentData.timeStr || formatTimeDisplay(now),
      createdAt: paymentData.createdAt || Date.now(),
      status: paymentData.status || 'completed',
      notes: paymentData.notes?.trim() || '',
    };
    setClickPayments((prev) => {
      const updated = [newPayment, ...prev];
      saveClickPayments(updated, accountId);
      return updated;
    });
    return newPayment;
  };

  const updateClickPayment = (paymentId, updates) => {
    setClickPayments((prev) => {
      const updated = prev.map((p) => (p.id === paymentId ? { ...p, ...updates } : p));
      saveClickPayments(updated, accountId);
      return updated;
    });
  };

  const deleteClickPayment = (paymentId) => {
    setClickPayments((prev) => {
      const updated = prev.filter((p) => p.id !== paymentId);
      saveClickPayments(updated, accountId);
      return updated;
    });
  };

  // Calculations for dashboard and quick monitors - purely dynamic!
  const allStations = rooms.flatMap((r) => r.stations || []);
  const totalRooms = rooms.length;
  const totalStations = allStations.length;
  const occupiedStations = allStations.filter((s) => s.status === 'occupied');
  const occupiedStationsCount = occupiedStations.length;
  const availableStationsCount = allStations.filter((s) => s.status === 'available').length;

  // Today's stats
  const todayKey = toDateKey(new Date());
  const todayTransactions = transactions.filter((tx) => tx.dateStr === todayKey);
  const todaySummary = calculateTransactionsSummary(todayTransactions);

  // Debts calculations
  const unpaidDebts = debts.filter((d) => d.status === 'unpaid');
  const unpaidDebtsCount = unpaidDebts.length;
  const totalUnpaidDebtAmount = unpaidDebts.reduce((sum, d) => sum + (Number(d.totalDebt) || 0), 0);
  const totalGamingDebt = unpaidDebts.reduce((sum, d) => sum + (Number(d.gameplayAmount) || 0), 0);
  const totalProductDebt = unpaidDebts.reduce((sum, d) => sum + (Number(d.productsAmount) || 0), 0);
  const paidDebts = debts.filter((d) => d.status === 'paid');
  const totalPaidDebtAmount = paidDebts.reduce((sum, d) => sum + (Number(d.totalDebt) || 0), 0);

  // Click Payments calculations
  const todayClickPayments = clickPayments.filter((p) => p.dateStr === todayKey);
  const todayClickTotal = todayClickPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalClickAmount = clickPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const clickPaymentsCount = clickPayments.length;

  return (
    <AppContext.Provider
      value={{
        rooms,
        transactions,
        settings,
        productsCatalog,
        debts,
        clickPayments,
        addProductToCatalog,
        updateProductInCatalog,
        deleteProductFromCatalog,
        addDebt,
        updateDebt,
        deleteDebt,
        markDebtAsPaid,
        finishSessionAsDebt,
        unpaidDebts,
        unpaidDebtsCount,
        totalUnpaidDebtAmount,
        totalGamingDebt,
        totalProductDebt,
        paidDebts,
        totalPaidDebtAmount,
        addClickPayment,
        updateClickPayment,
        deleteClickPayment,
        todayClickPayments,
        todayClickTotal,
        totalClickAmount,
        clickPaymentsCount,
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
        // Dynamic room actions
        addRoom,
        updateRoom,
        deleteRoom,
        addStationToRoom,
        removeStationFromRoom,
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
