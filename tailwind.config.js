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
        // Landing page colors
        sand: {
          50: '#fdfcfa',
          100: '#f9f6f1',
          200: '#f3ede4',
          300: '#ebe1d2',
          400: '#ddd0ba',
          500: '#c9b89c',
          600: '#ad9875',
          700: '#8f7a5a',
          800: '#76634a',
          900: '#62533f',
        },
        peach: {
          50: '#fef7f4',
          100: '#feece5',
          200: '#fed7ca',
          300: '#fdb9a2',
          400: '#fa916b',
          500: '#f26d3d',
          600: '#e05424',
          700: '#bb421b',
          800: '#9a391b',
          900: '#80331b',
        },
        lavender: {
          50: '#f8f7fc',
          100: '#f1eff9',
          200: '#e5e2f4',
          300: '#d1cbeb',
          400: '#b5abde',
          500: '#9688cd',
          600: '#7d6cba',
          700: '#6a59a3',
          800: '#594b87',
          900: '#4a3f6f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
