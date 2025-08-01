/** @type {import('tailwindcss').Config} */
const themeTokens = require('./src/styles/theme');

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: themeTokens.colors,
      fontFamily: {
        body: themeTokens.fonts.body,
        heading: themeTokens.fonts.heading,
      },
      spacing: themeTokens.spacing,
    },
  },
  plugins: [],
};