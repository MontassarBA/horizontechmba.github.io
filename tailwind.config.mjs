/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Charte graphique HORIZONTECH MBA
        primary: {
          50: '#e6ffff',
          100: '#ccffff',
          200: '#99ffff',
          300: '#66e6e6',
          400: '#33cccc',
          500: '#009999',  // Teal Institutionnel
          600: '#008080',
          700: '#006666',
          800: '#004d4d',
          900: '#003333',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d4d4d4',
          300: '#b8b8b8',
          400: '#9c9c9c',
          500: '#6F6F6F',  // Gris MBA
          600: '#5c5c5c',
          700: '#474747',
          800: '#333333',
          900: '#1A1A1A',  // Noir Horizon
        },
        dark: {
          800: '#2a2a2a',
          900: '#1A1A1A',  // Noir Horizon (pour Footer)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
