/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        merino: {
          DEFAULT: '#F5EEDD',
          dark: '#EADFC7',
          light: '#FAF6ED',
        },
        'rock-blue': {
          DEFAULT: '#84B3CE',
          light: '#E2EEF5',
          dark: '#5B93B2',
          subtle: '#C2DCEB',
        },
        'venice-blue': {
          DEFAULT: '#16587B',
          hover: '#10435E',
          dark: '#0A2B3D',
          light: '#237AA9',
        },
        ink: {
          DEFAULT: '#0E2B3D',
          muted: '#4A6572',
          subtle: '#7895A5',
        },
        sand: {
          DEFAULT: '#E4DAC5',
          dark: '#D4C6AA',
          light: '#F0E9DA',
        },
        'warm-red': {
          DEFAULT: '#C84B31',
          hover: '#AE3C24',
          light: '#FBECE9',
        },
        sage: {
          DEFAULT: '#3E7B54',
          hover: '#316243',
          light: '#EDF5F0',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card-subtle': '0 1px 3px rgba(14, 43, 61, 0.05)',
        'elevated': '0 4px 12px rgba(14, 43, 61, 0.08)',
        'drawer': '-4px 0 24px rgba(14, 43, 61, 0.12)',
      }
    },
  },
  plugins: [],
}
