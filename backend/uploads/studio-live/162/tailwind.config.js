/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C41E3A',
        secondary: '#D4A017',
        accent: '#FF3A5C',
        bg: '#0A0A0F',
        surface: '#12121A',
        text: '#F0EDE8',
      },
      fontFamily: {
        heading: ['Bebas Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
