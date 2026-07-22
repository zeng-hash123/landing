/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a1a",
        surface: "#111127",
        "surface-hover": "#1a1a2e",
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
        },
        accent: "#a855f7",
        border: "rgba(255, 255, 255, 0.1)",
        text: {
          DEFAULT: "#f8fafc",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
