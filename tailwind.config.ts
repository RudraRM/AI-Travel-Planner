import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: "rgb(var(--color-ocean) / <alpha-value>)",
        "ocean-deep": "rgb(var(--color-ocean-deep) / <alpha-value>)",
        "ocean-strong": "rgb(var(--color-ocean-strong) / <alpha-value>)",
        "ocean-pressed": "rgb(var(--color-ocean-pressed) / <alpha-value>)",
        emerald: "rgb(var(--color-emerald) / <alpha-value>)",
        "emerald-strong": "rgb(var(--color-emerald-strong) / <alpha-value>)",
        sunset: "rgb(var(--color-sunset) / <alpha-value>)",
        "sunset-deep": "rgb(var(--color-sunset-deep) / <alpha-value>)",
        sky: "rgb(var(--color-sky) / <alpha-value>)",
        "sky-soft": "rgb(var(--color-sky-soft) / <alpha-value>)",
        navy: "rgb(var(--color-navy) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        "ink-faint": "rgb(var(--color-ink-faint) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        "line-strong": "rgb(var(--color-line-strong) / <alpha-value>)",
        raised: "rgb(var(--color-raised) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui"],
        sans: ["var(--font-inter)", "system-ui"],
      },
      borderRadius: {
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
