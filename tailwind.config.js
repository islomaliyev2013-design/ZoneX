/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NexPlay — Warm Gray + Teal Palette
        warm: {
          bg: '#F5F5F4',        // Main Background (stone-100)
          card: '#FFFFFF',      // Card & Sidebar Background (white)
          secondary: '#E7E5E4', // Secondary Background (stone-200)
          border: '#E7E5E4',    // Subtle Borders
          borderDark: '#D6D3D1',// Deeper borders
          text: '#292524',      // Primary Text (stone-800)
          muted: '#78716C',     // Secondary Text (stone-500)
        },
        tealAccent: {
          primary: '#0D9488',   // Primary Accent (teal-600)
          hover: '#0F766E',     // Hover (teal-700)
          secondary: '#14B8A6', // Secondary Accent (teal-500)
          soft: '#99F6E4',      // Soft Teal (teal-200)
          light: '#CCFBF1',     // Light Teal (teal-100)
          bg: '#F0FDFA',        // Background Teal (teal-50)
        },
        // Mapped legacy tokens for smooth compatibility
        midnight: {
          bg: '#F5F5F4',
          sidebar: '#FFFFFF',
          card: '#FFFFFF',
          cardHover: '#F5F5F4',
          surface: '#FFFFFF',
          border: '#E7E5E4',
          borderLight: '#E7E5E4',
          hover: '#F5F5F4',
          input: '#F5F5F4',
        },
        brand: {
          purple: '#0D9488',
          purpleHover: '#0F766E',
          purpleLight: '#14B8A6',
          purpleDark: '#115E59',
          lavender: '#0D9488',
          cyan: '#0D9488',
          cyanAccent: '#14B8A6',
        },
        gaming: {
          green: '#16A34A',
          greenBg: '#DCFCE7',
          red: '#DC2626',
          redBg: '#FEE2E2',
        },
      },
    },
  },
  plugins: [],
};
