/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#0d0d14',
        surface: '#13131a',
        'surface-hover': '#1a1a26',
        primary: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
        },
        accent: '#d946ef',
        border: 'rgba(255, 255, 255, 0.08)',
        text: {
          DEFAULT: '#ffffff',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Epilogue', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
