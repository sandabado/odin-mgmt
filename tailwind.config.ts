import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#0C0F14",
        carbon: "#11161D",
        steel: "#19212A",
        mercury: "#34404D",
        plasma: "#B9A6FF",
        flux: "#8DDBC9",
        halo: "#E6C781",
        bone: "#F2F3F0",
        ghost: "#A8B0BB",
      },
      fontFamily: {
        header: ["var(--font-records-display)", "Fraunces", "serif"],
        body: ["var(--font-records-body)", "Schibsted Grotesk", "sans-serif"],
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Book Antiqua",
          "Palatino",
          "serif",
        ],
        mono: ["SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        display: [
          "clamp(2.5rem, 5vw, 5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        h1: [
          "clamp(2rem, 4vw, 4rem)",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
        h2: [
          "clamp(1.5rem, 3vw, 2.5rem)",
          { lineHeight: "1.3", letterSpacing: "-0.01em" },
        ],
        h3: ["clamp(1.25rem, 2vw, 1.75rem)", { lineHeight: "1.4" }],
        "body-lg": ["1.125rem", { lineHeight: "1.8" }],
        body: ["1rem", { lineHeight: "1.8" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
      },
      fontWeight: {
        "header-light": "400",
        header: "600",
        "header-bold": "700",
        "header-black": "900",
        "body-regular": "400",
        "body-medium": "500",
        "body-bold": "700",
      },
    },
  },
  plugins: [],
};

export default config;
