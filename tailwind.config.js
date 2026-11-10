/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NexPlay — Obsidian + Electric Cyan Palette
        obsidian: {
          bg: '#090D14',
          sidebar: '#0D131D',
          card: '#151E2B',
          cardHover: '#1B2736',
          surface: '#1B2736',
          border: '#253449',
          borderLight: '#334661',
        },
        cyan: {
          primary: '#06B6D4',
          hover: '#0891B2',
          accent: '#22D3EE',
          light: '#67E8F9',
        },
        // Mapped theme tokens for backward-compatible instant propagation
        midnight: {
          bg: '#090D14',
          sidebar: '#0D131D',
          card: '#151E2B',
          cardHover: '#1B2736',
          surface: '#1B2736',
          border: '#253449',
          borderLight: '#334661',
          input: '#0F1622',
        },
        brand: {
          purple: '#06B6D4',         // Primary Cyan
          purpleHover: '#0891B2',    // Primary Cyan Hover
          purpleLight: '#22D3EE',    // Accent Cyan
          purpleDark: '#0E7490',     // Darker Cyan
          lavender: '#67E8F9',       // Light Cyan
          cyan: '#06B6D4',
          cyanAccent: '#22D3EE',
        },
        gaming: {
          green: '#22C55E',
          greenBg: 'rgba(34, 197, 94, 0.12)',
          red: '#EF4444',
          redBg: 'rgba(239, 68, 68, 0.12)',
        },
      },
    },
  },
  plugins: [],
};
