import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcfd",
          100: "#d3f6f8",
          200: "#a9ecf0",
          300: "#6fdde4",
          400: "#45dde0",
          500: "#1fbfd0",
          600: "#1799b0",
          700: "#177b90",
          800: "#1a6375",
          900: "#1a5262"
        },
        ink: "#0f2a33",
        cream: "#fbf8f3",
        sand: "#f1e9dc",
        gold: "#c9a45c"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "system-ui", "sans-serif"]
      },
      boxShadow: { soft: "0 10px 40px -12px rgba(15,42,51,0.25)" }
    }
  },
  plugins: []
};
export default config;
