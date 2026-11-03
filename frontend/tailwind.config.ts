import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "rgb(var(--color-bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-bg-secondary) / <alpha-value>)",
          card: "rgb(var(--color-bg-card) / <alpha-value>)",
        },
        forest: "rgb(var(--color-forest) / <alpha-value>)",
        sage: "rgb(var(--color-sage) / <alpha-value>)",
        coffee: "rgb(var(--color-coffee) / <alpha-value>)",
        ivory: "rgb(var(--color-ivory) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: {
          subtle: "rgb(var(--color-border-subtle) / <alpha-value>)",
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
