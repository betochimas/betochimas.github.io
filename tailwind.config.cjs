/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{jsx,js,ts,tsx}"],
  darkMode: 'class',
  purge: {
    content: [
      "./src/**/*.{html,js,jsx,ts,tsx}",
    ],
    safelist: [
      "fill-results-red",
      "fill-results-blue",
      "fill-results-unknown",
      "fill-margin-blue-inf",
      "fill-margin-blue-30",
      "fill-margin-blue-20",
      "fill-margin-blue-15",
      "fill-margin-blue-10",
      "fill-margin-blue-5",
      "fill-margin-blue-1",
      "fill-margin-red-1",
      "fill-margin-red-5",
      "fill-margin-red-10",
      "fill-margin-red-15",
      "fill-margin-red-20",
      "fill-margin-red-30",
      "fill-margin-red-inf",
    ]
  },
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
      },
      /*
        results-blue = blue-400 = #60a5fa
        results-red = red-400 = #f87171
        results-unknown = slate-400 = #94a3b8

        margin-inf-blue = blue-800 = #1e40af
        margin-30-blue = blue-700 = #1d4ed8
        margin-20-blue = blue-600 = #2563eb
        margin-15-blue = blue-500 = #3b82f6
        margin-10-blue = blue-400 = #60a5fa
        margin-5-blue = blue-300 = #93c5fd
        margin-1-blue = blue-200 = #bfdbfe
        margin-1-red = red-200 = #fecaca
        margin-5-red = red-300 = #fca5a5
        margin-10-red = red-400 = #f87171
        margin-15-red = red-500 = #ef4444
        margin-20-red = red-600 = #dc2626
        margin-30-red = red-700 = #b91c1c
        margin-inf-red = red-800 = #991b1b
      */
      colors: {
        'results-blue': '#60a5fa',
        'results-red': '#f87171',
        'results-unknown': '#94a3b8',
        //
        'margin-blue-inf': '#1e40af',
        'margin-blue-30': '#1d4ed8',
        'margin-blue-20': '#2563eb',
        'margin-blue-15': '#3b82f6',
        'margin-blue-10': '#60a5fa',
        'margin-blue-5': '#93c5fd',
        'margin-blue-1': '#bfdbfe',
        'margin-red-1': '#fecaca',
        'margin-red-5': '#fca5a5',
        'margin-red-10': '#f87171',
        'margin-red-15': '#ef4444',
        'margin-red-20': '#dc2626',
        'margin-red-30': '#b91c1c',
        'margin-red-inf': '#991b1b',
      }

    },
  },
  plugins: [],
}

