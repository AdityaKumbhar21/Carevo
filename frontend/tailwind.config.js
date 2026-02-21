/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
          800: '#1E293B',
        },
        accent: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
        }
      },
    },
  },
  plugins: [],
}