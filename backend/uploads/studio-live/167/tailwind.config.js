/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3a3d3b',
        secondary: '#d9cab3',
        accent: '#b44b3e',
        bg: '#f4f1ea',
        surface: '#ffffff',
        text: '#2e2e2e',
      },
      fontFamily: {
        heading: ['Noto Serif JP', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Noto Sans JP', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
