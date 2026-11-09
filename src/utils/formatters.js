/**
 * Format numbers as currency with symbol
 */
export function formatCurrency(amount, currency = '$') {
  const num = Number(amount) || 0;
  // If currency is a symbol like $, €, £, prefix it; otherwise suffix or format neatly
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency} ${formatted}`;
}

/**
 * Format duration in milliseconds to HH:MM:SS (for live timers)
 */
export function formatTimer(ms) {
  if (ms == null || ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format duration in human-readable short string (e.g. 1h 24m)
 */
export function formatDurationHuman(ms) {
  if (ms == null || ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Format timestamp to Date string YYYY-MM-DD
 */
export function toDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format timestamp to local display date (e.g., Nov 9, 2026)
 */
export function formatDateDisplay(dateValue) {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format timestamp to local display time (e.g., 02:45 PM)
 */
export function formatTimeDisplay(dateValue) {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get date string for yesterday
 */
export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

/**
 * Get date string for today
 */
export function getTodayKey() {
  return toDateKey(new Date());
}

