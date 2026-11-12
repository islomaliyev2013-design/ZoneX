/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 1:1 Midnight Black + Purple Design System
        midnight: {
          bg: '#101014',
          card: '#1D1B2E',
          surface: '#1D1B2E',
          cardHover: '#25233B',
          sidebar: '#1D1B2E',
          input: '#101014',
          border: 'rgba(167, 139, 250, 0.15)',
          borderLight: 'rgba(167, 139, 250, 0.25)',
          hover: '#25233B',
        },
        purpleTheme: {
          primary: '#7C3AED',
          hover: '#6D28D9',
          light: '#A78BFA',
          glow: 'rgba(124, 58, 237, 0.35)',
        },
        content: {
          main: '#FFFFFF',
          secondary: '#A1A1AA',
        },
        // Backward-compatibility token mappings so all references resolve to Midnight Black + Purple
        warm: {
          bg: '#101014',
          card: '#1D1B2E',
          secondary: '#1D1B2E',
          border: 'rgba(167, 139, 250, 0.15)',
          borderDark: 'rgba(167, 139, 250, 0.25)',
          text: '#FFFFFF',
          muted: '#A1A1AA',
        },
        tealAccent: {
          primary: '#7C3AED',
          hover: '#6D28D9',
          secondary: '#A78BFA',
          soft: '#C4B5FD',
          light: 'rgba(124, 58, 237, 0.2)',
          bg: '#1D1B2E',
        },
        brand: {
          purple: '#7C3AED',
          purpleHover: '#6D28D9',
          purpleLight: '#A78BFA',
          purpleDark: '#5B21B6',
          lavender: '#A78BFA',
          cyan: '#7C3AED',
          cyanAccent: '#A78BFA',
        },
        gaming: {
          green: '#22C55E',
          greenBg: 'rgba(34, 197, 94, 0.15)',
          red: '#EF4444',
          redBg: 'rgba(239, 68, 68, 0.15)',
        },
      },
    },
  },
  plugins: [],
};
