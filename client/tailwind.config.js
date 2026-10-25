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
        },
        // Inspo Bento Pastel & Contrast Palette
        bento: {
          yellow: '#FEF3C7',
          'yellow-border': '#FDE68A',
          'yellow-text': '#78350F',
          purple: '#EDE9FE',
          'purple-border': '#DDD6FE',
          'purple-text': '#4C1D95',
          pink: '#FCE7F3',
          'pink-border': '#FBCFE8',
          'pink-text': '#831843',
          mint: '#DCFCE7',
          'mint-border': '#BBF7D0',
          'mint-text': '#064E3B',
          sky: '#E0F2FE',
          'sky-border': '#BAE6FD',
          'sky-text': '#0C4A6E',
          dark: '#161F28',
          'dark-card': '#1E293B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.35rem',
        '3xl': '1.85rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'card-subtle': '0 2px 10px rgba(14, 43, 61, 0.04)',
        'elevated': '0 10px 30px rgba(14, 43, 61, 0.08)',
        'bento': '0 4px 20px -2px rgba(14, 43, 61, 0.05), 0 2px 8px -1px rgba(14, 43, 61, 0.03)',
        'bento-hover': '0 14px 32px -4px rgba(14, 43, 61, 0.1), 0 4px 12px -2px rgba(14, 43, 61, 0.04)',
        'drawer': '-8px 0 32px rgba(14, 43, 61, 0.12)',
      }
    },
  },
  plugins: [],
}
