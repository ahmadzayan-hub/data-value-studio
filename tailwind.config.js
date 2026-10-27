/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C8A967',
        'gold-light': '#E0C98A',
        navy: '#0D1F3C',
        'navy-light': '#1A3560',
      },
    },
  },
  plugins: [],
}
