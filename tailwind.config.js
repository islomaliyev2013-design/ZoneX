/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          bg: '#101014',
          sidebar: '#14131C',
          card: '#1D1B2E',
          cardHover: '#25233A',
          border: '#302B42',
          borderLight: '#3D3754',
          input: '#161522',
        },
        brand: {
          purple: '#7C3AED',
          purpleHover: '#6D28D9',
          purpleLight: '#A78BFA',
          lavender: '#C4B5FD',
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
