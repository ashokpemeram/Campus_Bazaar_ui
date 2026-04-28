/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 20px 60px rgba(79, 70, 229, 0.35)"
      }
    }
  },
  plugins: []
};
