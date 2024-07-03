/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,js,html}", "./*.{ts,js,html}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['business'],
  },
  plugins: [require("daisyui")],
};
