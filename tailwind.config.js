/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08080D",
        surface: "#12121A",
        primary: "#7B2CFF",
        primaryHover: "#9A4DFF",
        primaryLight: "#B47DFF",
        text: "#F5F5FA",
        secondary: "#B8B8C8",
      },
    },
  },
  plugins: [],
};