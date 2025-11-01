/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'airtel': {
          primary: '#FF9800',
          secondary: '#F57C00',
          light: '#FFE0B2',
        },
        'flipkart': {
          primary: '#9C27B0',
          secondary: '#7B1FA2',
          light: '#E1BEE7',
        },
        'success': '#4CAF50',
        'warning': '#FFC107',
        'error': '#F44336',
        'info': '#2196F3',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}