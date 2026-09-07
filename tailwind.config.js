/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          950: '#080a0f',
          900: '#0f141c',
          850: '#151b26',
          800: '#1d2433',
          700: '#2c364c',
          600: '#3e4c6b',
          500: '#5a6d94',
          400: '#8ba0c9',
          300: '#b8c7e3',
          200: '#dce4f3',
          100: '#edf2fa',
          50: '#f7f9fd',
        },
        garden: {
          emerald: '#10b981',
          mint: '#34d399',
          sage: '#84cc16',
          dark: '#064e3b',
        },
        media: {
          amber: '#f59e0b',
          indigo: '#6366f1',
          rose: '#f43f5e',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        serif: ['Charter', 'Bitstream Charter', 'Sitka Text', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(16, 185, 129, 0.15)',
        'glow-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.25)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
};
