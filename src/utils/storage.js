export const INITIAL_ROOMS_COUNT = 5;
export const STATIONS_PER_ROOM = 5;

// Clean storage v4 keys - starts 100% from 0 for all accounts
const getRoomsKey = (accountId = 'account_admin') => `ps_rooms_data_v4_${accountId}`;
const getTransactionsKey = (accountId = 'account_admin') => `ps_transactions_data_v4_${accountId}`;
const getSettingsKey = (accountId = 'account_admin') => `ps_settings_v4_${accountId}`;
const getCatalogKey = (accountId = 'account_admin') => `ps_catalog_v4_${accountId}`;

// Automatic cleanup of legacy test data from localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith('ps_transactions_data_v1') ||
          k.startsWith('ps_transactions_data_v2') ||
          k.startsWith('ps_transactions_data_v3') ||
          k.startsWith('ps_rooms_data_v1') ||
          k.startsWith('ps_rooms_data_v2') ||
          k.startsWith('ps_rooms_data_v3') ||
          k.startsWith('ps_catalog_v1') ||
          k.startsWith('ps_catalog_v2') ||
          k.startsWith('ps_catalog_v3'))
      ) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

export const ROOM_DEFAULT_CONFIGS = {};

/**
 * Helper to create a new room object with optional stations
 */
export function createRoomObject({
  id,
  name,
  zoneName,
  zoneType = 'Standart Zal',
  hourlyRate = 20000,
  isUnlimitedOnly = false,
  stationCount = 0,
}) {
  const finalName = name || `Room ${id}`;
  const stations = [];
  const count = Number(stationCount) || 0;
  for (let s = 1; s <= count; s++) {
    stations.push({
      id: `r${id}-s${s}`,
      roomId: id,
      roomName: finalName,
      zoneName: zoneName || finalName,
      zoneType,
      stationNumber: s,
      stationName: `Station ${s}`,
      hourlyRate: Number(hourlyRate) || 20000,
      isUnlimitedOnly: Boolean(isUnlimitedOnly),
      status: 'available',
      session: null,
    });
  }

  return {
    id,
    name: finalName,
    zoneName: zoneName || finalName,
    zoneType,
    hourlyRate: Number(hourlyRate) || 20000,
    isUnlimitedOnly: Boolean(isUnlimitedOnly),
    stations,
  };
}

/**
 * Generate initial rooms structure.
 * By default returns empty array [] so everything starts from 0.
 * If optional count is passed (> 0), creates that many rooms.
 */
export function generateInitialRooms(count = 5) {
  if (!count || count <= 0) {
    return [];
  }
  const rooms = [];
  for (let r = 1; r <= count; r++) {
    rooms.push(
      createRoomObject({
        id: r,
        name: `Room ${r}`,
        zoneName: `Room ${r}`,
        zoneType: 'Standart Zal',
        hourlyRate: 20000,
        isUnlimitedOnly: false,
        stationCount: 5,
      })
    );
  }
  return rooms;
}

/**
 * Load rooms for a specific account.
 * Starts with empty array [] so user adds their own rooms and consoles.
 */
export function loadRooms(accountId = 'account_admin') {
  try {
    const key = getRoomsKey(accountId);
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load rooms from localStorage:', err);
  }
  // Fresh account starts from 0 rooms
  const initial = [];
  saveRooms(initial, accountId);
  return initial;
}

export function saveRooms(rooms, accountId = 'account_admin') {
  try {
    localStorage.setItem(getRoomsKey(accountId), JSON.stringify(rooms));
  } catch (err) {
    console.error('Failed to save rooms to localStorage:', err);
  }
}

/**
 * Load transactions for a specific account.
 * Starts with completely empty array [] for any new account.
 */
export function loadTransactions(accountId = 'account_admin') {
  try {
    const key = getTransactionsKey(accountId);
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load transactions from localStorage:', err);
  }
  return [];
}

export function saveTransactions(transactions, accountId = 'account_admin') {
  try {
    localStorage.setItem(getTransactionsKey(accountId), JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage:', err);
  }
}

/**
 * Load settings for a specific account
 */
export function loadSettings(accountId = 'account_admin') {
  try {
    const key = getSettingsKey(accountId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  const defaults = {
    currency: "so'm",
    defaultHourlyRate: 20000,
  };
  saveSettings(defaults, accountId);
  return defaults;
}

export function saveSettings(settings, accountId = 'account_admin') {
  try {
    localStorage.setItem(getSettingsKey(accountId), JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

/**
 * Products catalog starts empty [] so the user adds their own products
 */
export const DEFAULT_CATALOG = [];

export function loadProductsCatalog(accountId = 'account_admin') {
  try {
    const key = getCatalogKey(accountId);
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load products catalog:', err);
  }
  saveProductsCatalog([], accountId);
  return [];
}

export function saveProductsCatalog(catalog, accountId = 'account_admin') {
  try {
    localStorage.setItem(getCatalogKey(accountId), JSON.stringify(catalog));
  } catch (err) {
    console.error('Failed to save products catalog:', err);
  }
}
