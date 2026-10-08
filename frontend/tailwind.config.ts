import type { Config } from "tailwindcss";

// Airbnb design tokens (see CLAUDE.md "Airbnb look & feel"). Loaded from
// app/globals.css via `@config`, since Tailwind v4 no longer auto-detects this file.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#FF385C", hover: "#E00B41" },
        ink: "#222222",
        muted: { DEFAULT: "#6A6A6A", light: "#717171" },
        line: { DEFAULT: "#DDDDDD", light: "#EBEBEB" },
        subtle: "#F7F7F7",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      boxShadow: {
        pill: "0 3px 12px rgba(0,0,0,0.1)",
      },
      backgroundImage: {
        // Airbnb's primary button uses a pink-red gradient.
        "brand-gradient": "linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)",
      },
    },
  },
};

export default config;
