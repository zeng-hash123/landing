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
        background: "#0d0d14",
        surface: "#13131a",
        "surface-hover": "#1a1a26",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
        },
        accent: "#d946ef",
        border: "rgba(255, 255, 255, 0.08)",
        text: {
          DEFAULT: "#ffffff",
          muted: "#94a3b8",
          subtle: "#64748b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Epilogue", "sans-serif"],
      },
    },
  },
  plugins: [],
};
