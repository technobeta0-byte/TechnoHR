/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4AF37',
          600: '#C9A84C',
          700: '#B8860B',
          800: '#92670A',
          900: '#78350F',
        },
        dark: {
          bg:     '#0F0F1A',
          card:   '#1A1A2E',
          card2:  '#16213E',
          border: '#2A2A4A',
          text:   '#E2E8F0',
          muted:  '#94A3B8',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:   { '0%': { transform: 'translateY(24px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' }, '50%': { boxShadow: '0 0 0 14px rgba(212,175,55,0)' } },
      }
    },
  },
  plugins: [],
}
