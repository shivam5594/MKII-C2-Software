import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#060A12', 800: '#0A0E1A', 700: '#0D1117',
          600: '#131A24', 500: '#1A2332', 400: '#243044',
          300: '#3A4A62', 200: '#5A6A82', 100: '#8899AA',
        },
        cyan: {
          700: '#007A8A', 600: '#00ACC1', 500: '#00E5FF',
          400: '#00D4FF', 300: '#33E8FF', 200: '#80F0FF', 100: '#B3F5FF',
        },
        amber: {
          500: '#C9A84C', 400: '#D4B86A', 300: '#E0C888',
          200: '#ECD8A6', 100: '#F5ECCC',
        },
        status: {
          nominal: '#00E5FF', caution: '#FFB800',
          warning: '#FF6B35', critical: '#E24B4A',
          offline: '#3A4A62', active: '#00FF88',
        },
      },
      fontFamily: {
        display: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.15)',
        'glow-cyan-strong': '0 0 40px rgba(0, 229, 255, 0.3)',
        'glow-amber': '0 0 20px rgba(201, 168, 76, 0.15)',
        'glow-red': '0 0 20px rgba(226, 75, 74, 0.2)',
      },
    },
  },
  plugins: [],
} satisfies Config
