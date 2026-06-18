/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          900: '#1a1410',
          800: '#2a2018',
          700: '#3a2a1f',
          600: '#4a3528',
          500: '#5a4030',
        },
        gold: {
          DEFAULT: '#c9a227',
          light: '#d4b84a',
          dark: '#a68520',
          muted: '#8b7020',
        },
        ivory: {
          DEFAULT: '#fffff0',
          dark: '#f5f5dc',
          paper: '#faf8f0',
        },
        parchment: {
          DEFAULT: '#fcf5e5',
          dark: '#e8dcc8',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'premium': '0 0 20px rgba(201, 162, 39, 0.15), 0 4px 6px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'leather-texture': 'linear-gradient(135deg, #2a2018 0%, #1a1410 100%)',
        'parchment-texture': 'linear-gradient(135deg, #faf8f0 0%, #e8dcc8 100%)',
      }
    },
  },
  plugins: [],
}
