/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          dark: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          accent: '#58a6ff',
          gold: '#f1e05a',
          xp: '#2ea043',
          mind: '#38bdf8',
          body: '#f87171',
          craft: '#34d399',
        }
      }
    },
  },
  plugins: [],
}
