import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // IndiePage-style warm amber accent
        accent: {
          DEFAULT: "#f5a623",
          soft: "#fbbf24",
          ring: "#fcd9a0",
        },
        ink: "#0f172a",
        muted: "#6b7280",
        page: "#f0f0f0",
      },
      maxWidth: {
        page: "1280px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        "4xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
