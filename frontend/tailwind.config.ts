import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#101511",
          secondary: "#171E19",
          card: "#1C2520",
        },
        forest: "#294C39",
        sage: "#6D9978",
        coffee: "#604534",
        ivory: "#F1EEE4",
        muted: "#A4ADA4",
        border: {
          subtle: "#303A33",
        },
      },
      fontFamily: {
        serif: ["'Fraunces'", "'Noto Serif JP'", "serif"],
        sans: ["'Inter'", "'Noto Sans JP'", "sans-serif"],
      },
      borderRadius: {
        anteiku: "0.625rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
