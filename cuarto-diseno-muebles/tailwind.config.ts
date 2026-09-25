import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0b0d0a",
          900: "#10130d",
          850: "#151911",
          800: "#1b2016",
          700: "#262d1e",
          600: "#343d29",
          500: "#4a5539",
        },
        wood: {
          500: "#b8804d",
          400: "#d19a63",
        },
        stage: {
          pending: "#3c4552",
          active: "#eab308",
          done: "#22c55e",
          blocked: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
