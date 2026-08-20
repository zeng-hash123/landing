/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fafafa",
        surface: "#ffffff",
        "surface-hover": "#f4f4f5",
        border: "#e4e4e7",
        subtle: "#71717a",
        heading: "#09090b",
        primary: {
          DEFAULT: "#09090b",
          hover: "#27272a",
        },
        accent: {
          DEFAULT: "#2563eb",
          light: "#eff6ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "'Bricolage Grotesque'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
