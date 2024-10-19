/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  theme: {
    extend: {
      screens: {
        xs: { max: "600px" }, // Breakpoint pour 500px et en dessous
      },
    },
  },
};
