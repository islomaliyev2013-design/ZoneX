/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D19',
          900: '#0A1224',
          800: '#0F1C36',
          700: '#172B52',
          600: '#1E3A6D',
        },
      },
    },
  },
  plugins: [],
};

