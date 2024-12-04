import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary game theme colors
        primary: {
          50: '#eef9ff',
          100: '#dcf3ff',
          200: '#b3e7ff',
          300: '#66d3ff',
          400: '#1cb7ff',
          500: '#009fff',
          600: '#0077cc',
          700: '#005c9e',
          800: '#004d83',
          900: '#003d68',
        },
        // Secondary accent colors
        accent: {
          50: '#fff1f3',
          100: '#ffe0e4',
          200: '#ffc7cf',
          300: '#ff9eac',
          400: '#ff647a',
          500: '#ff2d52',
          600: '#ed1539',
          700: '#c80d2f',
          800: '#a50f2c',
          900: '#8a112b',
        },
        // Game UI elements
        game: {
          exp: '#FFD700',      // Experience points
          health: '#FF5555',   // Health/vitality
          mana: '#5555FF',     // Mana/energy
          nature: '#55FF55',   // Nature/earth
        },
        // Background gradients
        gradient: {
          start: '#1a1c2e',
          end: '#2a3142',
        }
      },
      boxShadow: {
        'game': '0 0 15px rgba(0, 159, 255, 0.5)',
        'game-hover': '0 0 20px rgba(0, 159, 255, 0.7)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-game': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
    },
  },
  plugins: [],
};

export default config;
