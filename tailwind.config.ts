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
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Palatino", "serif"],
        mono: ["SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
