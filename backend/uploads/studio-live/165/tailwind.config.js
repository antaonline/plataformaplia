/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        secondary: '#F5F0E8',
        accent: '#E8571A',
        bg: '#080808',
        surface: '#141414',
        text: '#F5F0E8',
      },
      fontFamily: {
        heading: ['Bebas Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
