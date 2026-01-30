/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // IMPORTANT for theme toggle
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        darkbg: "#0b0f17",
        darkpanel: "#0d1117",
        darkborder: "#1f2937"
      }
    },
  },
  plugins: [],
};
