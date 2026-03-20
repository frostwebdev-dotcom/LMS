import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Harmony Hearts Homecare: teal primary, gold accent */
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d97706",
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          900: "#451a03",
        },
      },
      keyframes: {
        "landing-fade-in-up": {
          from: { opacity: "0", transform: "translateY(1rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "landing-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "landing-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, -4%) scale(1.03)" },
          "66%": { transform: "translate(-3%, 3%) scale(0.97)" },
        },
        "landing-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "landing-fade-in-up": "landing-fade-in-up 0.7s ease-out both",
        "landing-fade-in-up-delay-1": "landing-fade-in-up 0.7s ease-out 0.1s both",
        "landing-fade-in-up-delay-2": "landing-fade-in-up 0.7s ease-out 0.2s both",
        "landing-fade-in-up-delay-3": "landing-fade-in-up 0.7s ease-out 0.3s both",
        "landing-fade-in-up-delay-4": "landing-fade-in-up 0.7s ease-out 0.4s both",
        "landing-fade-in": "landing-fade-in 0.6s ease-out both",
        "landing-fade-in-delayed": "landing-fade-in 0.6s ease-out 0.35s both",
        "landing-float": "landing-float 18s ease-in-out infinite",
        "landing-float-slow": "landing-float 24s ease-in-out infinite reverse",
        "landing-shimmer": "landing-shimmer 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
