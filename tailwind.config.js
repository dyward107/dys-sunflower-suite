/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['Sirivennela', 'serif'],  // Application name/branding font
        base: ['Quicksand', 'sans-serif'], // Everything else uses Quicksand
      },
      colors: {
        sunflower: {
          // Primary Palette (from spec)
          cream: '#FFF9C4',        // Primary page background, light highlights
          beige: '#FFECB3',        // Cards, containers, panels
          green: '#AED581',        // Success messages, positive accents
          taupe: '#D7CCC8',        // Borders, dividers, neutral containers
          'taupe-light': '#E8E0DC', // Subtle borders
          brown: '#633112',        // Headings, emphasis text, "ink" color
          gold: '#E3A008',         // Primary buttons, accents, highlights
          'gold-dark': '#C98506',  // Hover for buttons
          // Legacy scale (keep for compatibility)
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
