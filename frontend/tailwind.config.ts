import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
      colors: {
        'poker': {
          'felt': '#0d1f12',
          'felt-light': '#1a3d22',
          'gold': '#d4af37',
          'gold-light': '#f4d03f',
          'accent': '#ff6b35',
          'card': '#fefdf8',
          'card-back': '#1e3a5f',
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(212, 175, 55, 0.1)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
        'glow': '0 0 30px rgba(212, 175, 55, 0.4)',
        'glow-accent': '0 0 30px rgba(255, 107, 53, 0.4)',
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      backgroundImage: {
        'felt-texture': "url('/textures/felt.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} satisfies Config
