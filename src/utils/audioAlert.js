/**
 * PlayStation Manager — Loud Audio Alarm System
 * Web Audio API based synthesizer for loud, unmistakable alerts when session time expires.
 * Does not depend on external MP3 files, works offline, and overcomes autoplay restrictions.
 */

let audioCtx = null;
let isAudioUnlocked = false;

// Active alarms map: stationId -> { intervalId, stopFn }
const activeAlarms = new Map();
const alarmListeners = new Set();

function notifyListeners() {
  const activeIds = Array.from(activeAlarms.keys());
  alarmListeners.forEach((fn) => {
    try {
      fn(activeIds);
    } catch (e) {
      console.error('Error in alarm listener:', e);
    }
  });
}

/**
 * Initialize or get AudioContext
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Auto-unlock AudioContext on first user interaction
 */
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      isAudioUnlocked = true;
    }
    // Remove listeners once unlocked
    ['click', 'keydown', 'touchstart'].forEach((evt) => {
      window.removeEventListener(evt, unlockAudio);
    });
  };

  ['click', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { passive: true, once: true });
  });
}

/**
 * Play a single loud piercing beep pattern (3 rapid loud beeps)
 */
function playBeepPattern(ctx) {
  if (!ctx) return;
  const now = ctx.currentTime;

  // Pattern: 3 rapid loud high-pitch alert beeps
  // Beep 1: 950 Hz
  // Beep 2: 1250 Hz
  // Beep 3: 1550 Hz
  const beeps = [
    { time: now + 0.0, duration: 0.12, freq: 950 },
    { time: now + 0.16, duration: 0.12, freq: 1250 },
    { time: now + 0.32, duration: 0.16, freq: 1550 },
  ];

  beeps.forEach(({ time, duration, freq }) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Square or sawtooth wave gives a loud, sharp game-lounge buzzer sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      // Volume envelope: High gain (0.85) for loud sound, quick attack/decay
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(0.85, time + 0.02);
      gain.gain.setValueAtTime(0.85, time + duration - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    } catch (err) {
      console.warn('Web Audio beep error:', err);
    }
  });
}

/**
 * Start loud continuous alarm for a station when its time is up
 * @param {string|number} stationId
 */
export function playAlarm(stationId) {
  const idStr = String(stationId);
  if (activeAlarms.has(idStr)) {
    // Already ringing
    return;
  }

  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Play immediately
  playBeepPattern(ctx);

  // Repeat every 1.1 seconds until stopped
  const intervalId = setInterval(() => {
    const currentCtx = getAudioContext();
    playBeepPattern(currentCtx);
  }, 1100);

  activeAlarms.set(idStr, {
    intervalId,
    startedAt: Date.now(),
  });

  notifyListeners();
}

/**
 * Stop alarm for a specific station
 * @param {string|number} stationId
 */
export function stopAlarm(stationId) {
  const idStr = String(stationId);
  const alarm = activeAlarms.get(idStr);
  if (alarm) {
    clearInterval(alarm.intervalId);
    activeAlarms.delete(idStr);
    notifyListeners();
  }
}

/**
 * Stop all active alarms
 */
export function stopAllAlarms() {
  activeAlarms.forEach((alarm) => {
    clearInterval(alarm.intervalId);
  });
  activeAlarms.clear();
  notifyListeners();
}

/**
 * Check if a station is currently ringing
 * @param {string|number} stationId
 * @returns {boolean}
 */
export function isAlarmActive(stationId) {
  return activeAlarms.has(String(stationId));
}

/**
 * Get all station IDs that are currently ringing
 * @returns {string[]}
 */
export function getActiveAlarmStationIds() {
  return Array.from(activeAlarms.keys());
}

/**
 * Subscribe to alarm status changes (e.g. React components)
 * @param {Function} callback (activeStationIds: string[]) => void
 * @returns {Function} unsubscribe
 */
export function subscribeAlarms(callback) {
  alarmListeners.add(callback);
  return () => {
    alarmListeners.delete(callback);
  };
}

/**
 * Quick preview/test sound for checking loudness
 */
export function testAlarmSound() {
  const ctx = getAudioContext();
  playBeepPattern(ctx);
}

