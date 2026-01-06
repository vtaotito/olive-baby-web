/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f7f8f3',
          100: '#eef0e6',
          200: '#dce1cd',
          300: '#c4cda9',
          400: '#a8b683',
          500: '#8fa066',
          600: '#738251',
          700: '#5a6641',
          800: '#4a5337',
          900: '#3f4730',
          950: '#202617',
        },
        baby: {
          pink: '#fce4ec',
          blue: '#e3f2fd',
          yellow: '#fff8e1',
          green: '#e8f5e9',
          purple: '#f3e5f5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
