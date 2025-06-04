// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ✨ 이 부분이 중요합니다. 'media' 대신 'class'를 사용합니다.
  theme: {
    extend: {},
  },
  plugins: [],
};