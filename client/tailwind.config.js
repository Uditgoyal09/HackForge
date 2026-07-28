/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0B13', // Deep navy/near-black
        surface: '#151522',
        primary: {
          DEFAULT: '#7C3AED', // Violet
          hover: '#6D28D9'
        },
        secondary: {
          DEFAULT: '#4F46E5', // Indigo
          hover: '#4338CA'
        },
        accent: {
          DEFAULT: '#06B6D4', // Cyan
          hover: '#0891B2'
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8'
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        border: '#2D2D3B'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(124, 58, 237, 0.5)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.5)',
      }
    },
  },
  plugins: [],
}
