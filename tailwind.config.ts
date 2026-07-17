import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        carbon: "#0A0A0F",
        steel: "#12121A",
        mercury: "#2A2A38",
        plasma: "#B026FF",
        flux: "#00FFC2",
        halo: "#FFD700",
        bone: "#EDEDED",
        ghost: "#8888A0",
      },
      fontFamily: {
        display: ["Space Grotesk", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
