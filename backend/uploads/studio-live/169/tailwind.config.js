/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        secondary: '#3b82f6',
        accent: '#e11d48',
        bg: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
      },
      fontFamily: {
        heading: ['Bebas Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
