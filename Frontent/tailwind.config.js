/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can add custom brand colors for SyntaxCV here
        brandBlue: '#3b82f6',
        darkBg: '#0f172a',
      },
    },
  },
  plugins: [],
}
