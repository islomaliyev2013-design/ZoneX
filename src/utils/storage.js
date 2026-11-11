export const INITIAL_ROOMS_COUNT = 5;
export const STATIONS_PER_ROOM = 5;

// Clean storage v3 keys - isolated per account and starts 100% from 0
const getRoomsKey = (accountId = 'account_admin') => `ps_rooms_data_v3_${accountId}`;
const getTransactionsKey = (accountId = 'account_admin') => `ps_transactions_data_v3_${accountId}`;
const getSettingsKey = (accountId = 'account_admin') => `ps_settings_v3_${accountId}`;
const getCatalogKey = (accountId = 'account_admin') => `ps_catalog_v3_${accountId}`;

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
          k.startsWith('ps_rooms_data_v1') ||
          k.startsWith('ps_rooms_data_v2'))
      ) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

export const ROOM_DEFAULT_CONFIGS = {
  1: { zoneName: 'The Platform', zoneType: 'Standart Zal', hourlyRate: 20000 },
  2: { zoneName: 'Game Zone', zoneType: 'Game Zone', hourlyRate: 20000 },
  3: { zoneName: 'Neon Pulse Lounge', zoneType: 'Vaqti Cheklanmagan', hourlyRate: 30000, isUnlimitedOnly: true },
  4: { zoneName: 'Grand Arena', zoneType: 'Comfort Zone', hourlyRate: 40000 },
  5: { zoneName: 'VIP Akustik Kabina', zoneType: 'VIP Kabina', hourlyRate: 50000 },
};

/**
 * Apply guaranteed room configurations and hourly rates to any rooms array.
 */
export function applyRoomConfigs(rawRooms) {
  if (!Array.isArray(rawRooms) || rawRooms.length !== INITIAL_ROOMS_COUNT) {
    return generateInitialRooms();
  }
  return rawRooms.map((room) => {
    const config = ROOM_DEFAULT_CONFIGS[room.id] || {
      zoneName: `Room ${room.id}`,
      zoneType: 'Zal',
      hourlyRate: 20000,
    };
    const stations = (room.stations || []).map((st) => ({
      ...st,
      zoneName: config.zoneName,
      zoneType: config.zoneType,
      hourlyRate: config.hourlyRate,
      isUnlimitedOnly: config.isUnlimitedOnly || false,
    }));
    return {
      ...room,
      zoneName: config.zoneName,
      zoneType: config.zoneType,
      hourlyRate: config.hourlyRate,
      isUnlimitedOnly: config.isUnlimitedOnly || false,
      stations,
    };
  });
}

/**
 * Generate clean initial rooms structure
 * 5 rooms, each with 5 PlayStation stations, all available.
 */
export function generateInitialRooms() {
  const rooms = [];
  for (let r = 1; r <= INITIAL_ROOMS_COUNT; r++) {
    const config = ROOM_DEFAULT_CONFIGS[r] || { zoneName: `Room ${r}`, zoneType: 'Zal', hourlyRate: 20000 };
    const stations = [];
    for (let s = 1; s <= STATIONS_PER_ROOM; s++) {
      stations.push({
        id: `r${r}-s${s}`,
        roomId: r,
        roomName: `Room ${r}`,
        zoneName: config.zoneName,
        zoneType: config.zoneType,
        stationNumber: s,
        stationName: `Station ${s}`,
        hourlyRate: config.hourlyRate,
        isUnlimitedOnly: config.isUnlimitedOnly || false,
        status: 'available', // 'available' | 'occupied'
        session: null,
      });
    }
    rooms.push({
      id: r,
      name: `Room ${r}`,
      zoneName: config.zoneName,
      zoneType: config.zoneType,
      hourlyRate: config.hourlyRate,
      isUnlimitedOnly: config.isUnlimitedOnly || false,
      stations,
    });
  }
  return rooms;
}

/**
 * Load rooms for a specific account.
 */
export function loadRooms(accountId = 'account_admin') {
  try {
    const key = getRoomsKey(accountId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === INITIAL_ROOMS_COUNT) {
        // Guarantee every room and station reflects its proper tiered hourly rate & zone
        const updated = applyRoomConfigs(parsed);
        saveRooms(updated, accountId);
        return updated;
      }
    }
  } catch (err) {
    console.error('Failed to load rooms from localStorage:', err);
  }
  const initial = generateInitialRooms();
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
    if (stored) {
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

export const DEFAULT_CATALOG = [
  { id: 'cat_1', name: 'Semichka (Qora)', purchasePrice: 5000, sellingPrice: 10000 },
  { id: 'cat_2', name: 'Coca-Cola 0.5L', purchasePrice: 7000, sellingPrice: 12000 },
  { id: 'cat_3', name: 'Fanta 0.5L', purchasePrice: 7000, sellingPrice: 12000 },
  { id: 'cat_4', name: 'Sprite 0.5L', purchasePrice: 7000, sellingPrice: 12000 },
  { id: 'cat_5', name: 'Pepsi 0.5L', purchasePrice: 7000, sellingPrice: 12000 },
  { id: 'cat_6', name: 'Suv 0.5L (Gazsiz)', purchasePrice: 2000, sellingPrice: 4000 },
  { id: 'cat_7', name: 'Flash Up Energy', purchasePrice: 8000, sellingPrice: 14000 },
  { id: 'cat_8', name: 'Red Bull', purchasePrice: 18000, sellingPrice: 25000 },
  { id: 'cat_9', name: 'Chips Lays', purchasePrice: 12000, sellingPrice: 18000 },
  { id: 'cat_10', name: 'Chips Pringles', purchasePrice: 20000, sellingPrice: 30000 },
  { id: 'cat_11', name: 'Chips Doritos', purchasePrice: 14000, sellingPrice: 22000 },
  { id: 'cat_12', name: 'Chips Cheetos', purchasePrice: 6000, sellingPrice: 10000 },
  { id: 'cat_13', name: 'Suxariki Flint', purchasePrice: 4000, sellingPrice: 8000 },
  { id: 'cat_14', name: 'Popkorn', purchasePrice: 6000, sellingPrice: 12000 },
  { id: 'cat_15', name: 'Semichka Oq (Xon)', purchasePrice: 6000, sellingPrice: 12000 },
  { id: 'cat_16', name: 'Snickers', purchasePrice: 8000, sellingPrice: 12000 },
  { id: 'cat_17', name: 'Twix', purchasePrice: 8000, sellingPrice: 12000 },
  { id: 'cat_18', name: 'Bounty', purchasePrice: 8000, sellingPrice: 12000 },
  { id: 'cat_19', name: 'KitKat', purchasePrice: 9000, sellingPrice: 14000 },
  { id: 'cat_20', name: 'Qahva 3-in-1 (Nescafe)', purchasePrice: 3000, sellingPrice: 6000 },
];

export function loadProductsCatalog(accountId = 'account_admin') {
  try {
    const key = getCatalogKey(accountId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge new default items by name to ensure new chips/drinks appear for existing accounts
        const existingNames = new Set(parsed.map((p) => (p.name || '').toLowerCase()));
        let hasNew = false;
        const merged = [...parsed];
        for (const item of DEFAULT_CATALOG) {
          if (!existingNames.has(item.name.toLowerCase())) {
            merged.push(item);
            hasNew = true;
          }
        }
        if (hasNew) {
          saveProductsCatalog(merged, accountId);
        }
        return merged;
      }
    }
  } catch (err) {
    console.error('Failed to load products catalog:', err);
  }
  saveProductsCatalog(DEFAULT_CATALOG, accountId);
  return DEFAULT_CATALOG;
}

export function saveProductsCatalog(catalog, accountId = 'account_admin') {
  try {
    localStorage.setItem(getCatalogKey(accountId), JSON.stringify(catalog));
  } catch (err) {
    console.error('Failed to save products catalog:', err);
  }
}
