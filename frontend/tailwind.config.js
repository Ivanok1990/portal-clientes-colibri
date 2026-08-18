/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 35 59 / 0.04), 0 1px 3px 0 rgb(16 35 59 / 0.06)',
      },
      colors: {
        // Colores derivados del prototipo de Figma.
        navy: {
          DEFAULT: '#16233b',
          light: '#1f3350',
        },
        primary: {
          DEFAULT: '#3f7cb8',
          dark: '#356aa0',
        },
      },
    },
  },
  plugins: [],
};
