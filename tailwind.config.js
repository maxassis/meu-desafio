/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'bondis-black': '#252823',
        'bondis-green': '#12FF55',
        'bondis-text-gray': '#EEEEEE',
        'bondis-gray-secondary': '#828282',
        'bondis-gray-dark': '#565656',
        'bondis-overlay': 'rgba(0, 0, 0, 0.5)',
        'bondis-alert-red': '#EB4335'
      },
      fontFamily: {
        'inter-regular': 'Inter_400Regular',
        'inter-bold': 'Inter_700Bold',
      }
    },
  },
  plugins: [],
}


