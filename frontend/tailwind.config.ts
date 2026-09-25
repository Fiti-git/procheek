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
        navy: {
          DEFAULT: "#0F1E3D",
          900: "#0F1E3D",
          950: "#0A1628",
        },
        "procheck-orange": {
          DEFAULT: "#FBB601",
          500: "#FBB601",
          600: "#D99A00",
        },
        coral: {
          DEFAULT: "#FBB601",
          50: "#FFF9E5",
          100: "#FFEFB8",
          400: "#FDC734",
          500: "#FBB601",
          600: "#D99A00",
          700: "#A67700",
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
        orangeGlow: "0 10px 40px -10px rgba(251, 182, 1, 0.5)",
        orangeGlowLg: "0 20px 60px -10px rgba(251, 182, 1, 0.7)",
        orangeGlowXl: "0 20px 80px -20px rgba(251, 182, 1, 0.4)",
        orangeHalo: "0 0 80px -20px rgba(251, 182, 1, 0.4)",
      },
    },
  },
  safelist: [
    { pattern: /^(bg|text|border)-(ink|canvas|line|coral|success|warn|danger|navy)/ },
  ],
  plugins: [],
};

export default config;
