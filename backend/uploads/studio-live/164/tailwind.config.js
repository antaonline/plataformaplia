/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C9A84C',
        secondary: '#8B1A1A',
        accent: '#E8D5A3',
        bg: '#0A0A0A',
        surface: '#141414',
        text: '#F0EDE8',
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
