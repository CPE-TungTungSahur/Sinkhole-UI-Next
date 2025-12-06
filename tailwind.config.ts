import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",

        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                slideLeftIn: {
                    "0%": {
                        transform: "translateX(20px)",
                        opacity: "0",
                    },
                    "100%": {
                        transform: "translateX(0)",
                        opacity: "1",
                    },
                },
            },
            animation: {
                slideLeftIn: "slideLeftIn 0.4s ease-out forwards",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
