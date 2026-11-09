export const INITIAL_ROOMS_COUNT = 5;
export const STATIONS_PER_ROOM = 5;

const getRoomsKey = (accountId = 'account_admin') => `ps_rooms_data_v2_${accountId}`;
const getTransactionsKey = (accountId = 'account_admin') => `ps_transactions_data_v2_${accountId}`;
const getSettingsKey = (accountId = 'account_admin') => `ps_settings_v2_${accountId}`;

/**
 * Generate clean initial rooms structure
 * 5 rooms, each with 5 PlayStation stations, all available.
 */
export function generateInitialRooms() {
  const rooms = [];
  for (let r = 1; r <= INITIAL_ROOMS_COUNT; r++) {
    const stations = [];
    for (let s = 1; s <= STATIONS_PER_ROOM; s++) {
      stations.push({
        id: `r${r}-s${s}`,
        roomId: r,
        roomName: `Room ${r}`,
        stationNumber: s,
        stationName: `Station ${s}`,
        status: 'available', // 'available' | 'occupied'
        session: null,
      });
    }
    rooms.push({
      id: r,
      name: `Room ${r}`,
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
        return parsed;
      }
    }
    // Backward compatibility migration for initial admin account
    if (accountId === 'account_admin') {
      const oldV1 = localStorage.getItem('ps_rooms_data_v1');
      if (oldV1) {
        const parsed = JSON.parse(oldV1);
        if (Array.isArray(parsed) && parsed.length === INITIAL_ROOMS_COUNT) {
          saveRooms(parsed, accountId);
          return parsed;
        }
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
    // Backward compatibility migration for initial admin account
    if (accountId === 'account_admin') {
      const oldV1 = localStorage.getItem('ps_transactions_data_v1');
      if (oldV1) {
        const parsed = JSON.parse(oldV1);
        if (Array.isArray(parsed)) {
          saveTransactions(parsed, accountId);
          return parsed;
        }
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
      // Migrate from dollar to Uzbek so'm
      if (!parsed.currency || parsed.currency === '$') {
        parsed.currency = "so'm";
        if (!parsed.defaultHourlyRate || parsed.defaultHourlyRate === 15) {
          parsed.defaultHourlyRate = 20000;
        }
        saveSettings(parsed, accountId);
      }
      return parsed;
    }
    if (accountId === 'account_admin') {
      const oldV1 = localStorage.getItem('ps_settings_v1');
      if (oldV1) {
        const parsed = JSON.parse(oldV1);
        if (!parsed.currency || parsed.currency === '$') {
          parsed.currency = "so'm";
          if (!parsed.defaultHourlyRate || parsed.defaultHourlyRate === 15) {
            parsed.defaultHourlyRate = 20000;
          }
        }
        saveSettings(parsed, accountId);
        return parsed;
      }
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

const getCatalogKey = (accountId = 'account_admin') => `ps_catalog_v1_${accountId}`;

export const DEFAULT_CATALOG = [
  { id: 'cat_1', name: 'Semichka', purchasePrice: 5000, sellingPrice: 10000 },
  { id: 'cat_2', name: 'Coca-Cola 0.5L', purchasePrice: 7000, sellingPrice: 12000 },
  { id: 'cat_3', name: 'Fanta 0.5L', purchasePrice: 7000, sellingPrice: 12000 },
  { id: 'cat_4', name: 'Suv 0.5L', purchasePrice: 2000, sellingPrice: 4000 },
  { id: 'cat_5', name: 'Red Bull', purchasePrice: 18000, sellingPrice: 25000 },
  { id: 'cat_6', name: 'Chips Lays', purchasePrice: 12000, sellingPrice: 18000 },
  { id: 'cat_7', name: 'Snickers', purchasePrice: 8000, sellingPrice: 12000 },
];

export function loadProductsCatalog(accountId = 'account_admin') {
  try {
    const key = getCatalogKey(accountId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
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
