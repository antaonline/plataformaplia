/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1D',
        secondary: '#4E4E50',
        accent: '#FFD700',
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#333333',
      },
      fontFamily: {
        heading: ['Playfair Display', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
