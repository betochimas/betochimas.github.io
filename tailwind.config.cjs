/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{jsx,js,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['inter', 'serif']
      },
      height: {
        '32': '8rem',
        '40': '10rem',
        '60': '15rem',
        '80': '20rem',
        '100': '25rem',
      }
    },
  },
  plugins: [],
}

