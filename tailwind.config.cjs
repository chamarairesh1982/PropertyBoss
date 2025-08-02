/** @type {import('tailwindcss').Config} */
const { colors, spacing, typography } = require('./src/styles/theme');

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: typography,
      spacing,
    },
  },
  plugins: [],
};