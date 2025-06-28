/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Standard Blue Back Palette
        'op-blue': {
          'deep-navy': '#1B3A57',
          'deep-navy-alt': '#2C4A6B',
          'medium': '#4A6FA5',
          'medium-alt': '#5B7BB8',
          'light': '#7BA7D9',
          'light-alt': '#A8C8E8',
        },
        // Leader Red Back Palette
        'op-red': {
          'deep-crimson': '#8B1538',
          'deep-crimson-alt': '#A91E47',
          'medium': '#C73E1D',
          'medium-alt': '#D4462A',
          'bright': '#FF4444',
          'bright-alt': '#E55B5B',
        },
        // Gold/Yellow Details
        'op-gold': {
          'primary': '#FFD700',
          'secondary': '#F4C842',
          'metallic': '#B8860B',
          'metallic-alt': '#CD853F',
          'dark': '#DAA520',
        },
        // White/Cream
        'op-white': {
          'pure': '#FFFFFF',
          'cream': '#FFFEF7',
          'cream-alt': '#F8F5E4',
        },
        // Common Design Elements
        'op-neutral': {
          'black': '#000000',
          'black-alt': '#1A1A1A',
          'dark-gray': '#333333',
          'dark-gray-alt': '#4A4A4A',
          'silver': '#C0C0C0',
          'silver-alt': '#D3D3D3',
        },
      },
    },
  },
  plugins: [],
} 