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
        ink: "#1a1a1a",
        muted: "#6b7280",
        page: "#e6e6e6",
      },
      maxWidth: {
        page: "640px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        "4xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
