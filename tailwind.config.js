/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          primary: '#4F46E5',
          secondary: '#7C3AED',
          accent: '#F59E0B',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
          dark: {
            DEFAULT: '#1F2937',
            lighter: '#374151',
            darker: '#111827',
          },
          light: {
            DEFAULT: '#F3F4F6',
            darker: '#E5E7EB',
            lighter: '#F9FAFB',
          }
        },
        rarity: {
          common: '#9CA3AF',
          uncommon: '#34D399',
          rare: '#3B82F6',
          epic: '#8B5CF6',
          legendary: '#F59E0B'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'quest-card': 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))',
        'stat-panel': 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))'
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'level-up': 'levelUp 1s ease-out',
        'achievement': 'achievementUnlock 0.6s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out'
      },
      keyframes: {
        levelUp: {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.2)', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' }
        },
        achievementUnlock: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' }
        }
      },
      scale: {
        '102': '1.02',
      },
      boxShadow: {
        'rpg': '0 0 15px rgba(79, 70, 229, 0.3)',
        'rpg-hover': '0 0 20px rgba(79, 70, 229, 0.4)',
        'achievement': '0 0 20px rgba(245, 158, 11, 0.5)',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'rpg': ['Inter', 'sans-serif'],
      },
      borderWidth: {
        'pixel': '4px',
      },
      backdropBlur: {
        'rpg': '8px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-rpg': {
          'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
        },
        '.text-shadow-none': {
          'text-shadow': 'none',
        },
        '.pixel-borders': {
          'border-style': 'solid',
          'border-width': '4px',
          'border-image-slice': '2',
          'border-image-width': '2',
          'border-image-outset': '0',
          'image-rendering': 'pixelated',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
