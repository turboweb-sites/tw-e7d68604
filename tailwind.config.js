/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: '#0e1621',
          chat: '#17212b',
          header: '#242f3d',
          input: '#242f3d',
          blue: '#2b5278',
          bubble: '#182533',
          userBubble: '#2b5278',
          text: '#f5f5f5',
          secondary: '#8b9fad',
          accent: '#64b5f6',
          green: '#4caf50',
          border: '#344654',
        }
      },
      fontFamily: {
        telegram: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};