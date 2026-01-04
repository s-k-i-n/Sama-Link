/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        night: '#0F172A',
        ivory: '#F5F3EF',
        amber: '#F59E0B',
        sage: '#6B8E7A',
        gray: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
