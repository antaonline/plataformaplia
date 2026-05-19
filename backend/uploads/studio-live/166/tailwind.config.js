/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C41E3A',
        secondary: '#B8960C',
        accent: '#FF2D4E',
        bg: '#080808',
        surface: '#111111',
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
