import type { Config } from "tailwindcss";

// Airbnb design tokens, measured from airbnb.co.in (Oct 2026) with getComputedStyle.
// Loaded from app/globals.css via `@config`, since Tailwind v4 no longer auto-detects this file.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#FF385C", hover: "#E00B41", deep: "#DA1249" },
        ink: "#222222",
        muted: { DEFAULT: "#6C6C6C", light: "#717171" },
        line: { DEFAULT: "#DDDDDD", light: "#EBEBEB", strong: "#B0B0B0" },
        subtle: "#F7F7F7",
        chip: "#F2F2F2",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "20px", // listing photos (airbnb.com moved from 12px to 20px)
        btn: "8px",
      },
      boxShadow: {
        // Search pill at rest
        pill: "0 0 0 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.1)",
        // Active segment inside the pill
        segment: "0 3px 12px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.08)",
        // Dropdown panels and menus
        panel: "0 2px 16px rgba(0,0,0,0.12)",
        // "Guest favourite" badge
        badge: "0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.1)",
      },
      backgroundImage: {
        // Airbnb's primary button uses a pink-red gradient.
        "brand-gradient": "linear-gradient(to right, #E61E4D 0%, #E31C5F 50%, #D70466 100%)",
        // Behind the expanded search bar on the home page.
        "header-fade": "linear-gradient(#FFFFFF 40%, #F8F8F8 100%)",
      },
    },
  },
};

export default config;
