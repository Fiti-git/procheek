import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1725",
          50: "#F7F8FA",
          100: "#EEF0F3",
          200: "#DADEE4",
          300: "#B0B7C3",
          400: "#828B9C",
          500: "#6E7684",
          600: "#4A5261",
          700: "#2B3441",
          800: "#1A2130",
          900: "#0F1725",
          950: "#080D18",
        },
        canvas: {
          DEFAULT: "#FBFBFA",
          2: "#F5F6F7",
          3: "#EEF0F3",
        },
        line: {
          DEFAULT: "#E4E6EA",
          strong: "#C9CDD4",
        },
        coral: {
          DEFAULT: "#FF6B35",
          50: "#FFF1EB",
          100: "#FFE1D3",
          400: "#FF8B5C",
          500: "#FF6B35",
          600: "#E85520",
          700: "#C24219",
        },
        success: {
          DEFAULT: "#059669",
          bg: "#ECFDF5",
          border: "#A7F3D0",
        },
        warn: {
          DEFAULT: "#B45309",
          bg: "#FEF3C7",
          border: "#FCD34D",
        },
        danger: {
          DEFAULT: "#B91C1C",
          bg: "#FEF2F2",
          border: "#FCA5A5",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        display: ['"Instrument Sans"', '"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"SF Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tight: "-0.02em",
        tighter: "-0.03em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 37, 0.04), 0 1px 3px rgba(15, 23, 37, 0.06)",
        cardHover:
          "0 4px 8px rgba(15, 23, 37, 0.06), 0 8px 24px rgba(15, 23, 37, 0.08)",
        subtle: "0 1px 0 rgba(15, 23, 37, 0.04)",
      },
    },
  },
  safelist: [
    { pattern: /^(bg|text|border)-(ink|canvas|line|coral|success|warn|danger)/ },
  ],
  plugins: [],
};

export default config;
