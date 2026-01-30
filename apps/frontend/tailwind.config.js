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
        primary: {
          DEFAULT: '#1E40AF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#1E40AF',
          600: '#1E3A8A',
          700: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#10B981',
          500: '#10B981',
          600: '#059669',
        },
        accent: {
          DEFAULT: '#F59E0B',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
};
