import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      animation: {
        "pulse-bars": "pulseBars 1.1s ease-in-out infinite",
        "float-slow": "floatSlow 8s ease-in-out infinite"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.12), 0 18px 50px rgba(2, 8, 23, 0.45)"
      },
      colors: {
        slate: {
          975: "#050816"
        }
      },
      keyframes: {
        pulseBars: {
          "0%, 100%": { transform: "scaleY(0.45)", opacity: "0.5" },
          "50%": { transform: "scaleY(1)", opacity: "1" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
