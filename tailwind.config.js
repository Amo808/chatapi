/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-very-dark': '#1F1A17',
        'surface': '#2B221F',
        'accent': '#B08668',
        'accent-dark': '#9A6B4F',
        'text': '#EFE6E0',
        'muted': '#CFC2BA',
        'divider': 'rgba(255,255,255,0.06)'
      },
      borderRadius: {
        'lg': '10px',
        'xl': '12px'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'typing': 'typing 1.4s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out'
      },
      keyframes: {
        typing: {
          '0%, 20%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
