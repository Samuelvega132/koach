import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#8b5cf6", // Violet 500
                    foreground: "#ffffff",
                },
                surface: {
                    light: "rgba(255, 255, 255, 0.05)",
                    dark: "rgba(0, 0, 0, 0.2)",
                },
                tuner: {
                    perfect: "#34d399", // Emerald 400
                    sharp: "#fcd34d", // Amber 300
                    flat: "#fb7185", // Rose 400
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "cyberpunk-glow": "linear-gradient(to right, #7c3aed, #db2777)", // Violet to Pink
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                glow: {
                    "0%": { boxShadow: "0 0 5px #a855f7, 0 0 10px #a855f7" },
                    "100%": { boxShadow: "0 0 10px #a855f7, 0 0 20px #a855f7" },
                }
            }
        },
    },
    plugins: [],
};
export default config;
