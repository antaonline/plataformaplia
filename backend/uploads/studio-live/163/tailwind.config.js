/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#C026D3',
        secondary: '#7C3AED',
        accent: '#F0ABFC',
        bg: '#0A0A0F',
        surface: '#13131C',
        text: '#F5F0FF',
      },
      fontFamily: {
        heading: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
