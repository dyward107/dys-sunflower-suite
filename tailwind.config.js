/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunflower: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        pastel: {
          yellow: '#FFF9C4',
          green: '#E8F5E9',
          blue: '#E3F2FD',
          pink: '#FCE4EC',
          lavender: '#F3E5F5',
        }
      },
    },
  },
  plugins: [],
}
