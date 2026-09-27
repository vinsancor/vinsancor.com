/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FFC70B',
          hover: '#E5B30A',
        },
        secondary: {
          DEFAULT: '#516460',
          hover: '#41504D',
        },
        dark: '#141A19',
        light: '#F9FAFB',
      },
      boxShadow: {
        soft: '0 10px 40px rgba(0, 0, 0, 0.05)',
        hover: '0 20px 50px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
