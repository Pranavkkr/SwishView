/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crewix: {
          light: '#e8efe5', // pale mint background
          accent: '#599c56', // leaf green
          dark: '#1e1e1e', // black/dark gray for active nav
          card: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
