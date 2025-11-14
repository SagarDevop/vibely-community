/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // for React/Vite
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}
