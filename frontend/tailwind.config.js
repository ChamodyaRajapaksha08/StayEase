/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#176B55',
          dark: '#123B35',
          light: '#23896E',
          50: '#E9F5F1',
          100: '#C7E7DE',
          600: '#176B55',
          700: '#125443',
          800: '#123B35',
        },
        secondary: '#123B35',
        background: '#F7F9F8',
        surface: '#FFFFFF',
        main: '#172B27',
        muted: '#71817B',
        success: '#16A36A',
        warning: '#E9A23B',
        danger: '#E45B5B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
