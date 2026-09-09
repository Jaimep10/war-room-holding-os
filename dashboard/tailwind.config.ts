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
          950: "#08090b",
          900: "#0d0f13",
          850: "#12151a",
          800: "#171b21",
          700: "#20252d",
          600: "#2b323c",
          500: "#3c4552",
        },
        accent: {
          500: "#6366f1",
          400: "#818cf8",
        },
        risk: {
          low: "#22c55e",
          medium: "#eab308",
          high: "#ef4444",
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
