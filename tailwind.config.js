/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './data/**/*.ts',
  ],
  theme: {
    extend: {
      screens: {
        // Phones in landscape: wide but very short, and touch-first.
        // Scoped to touch devices so desktop stays pixel-identical.
        short: {
          raw: '(orientation: landscape) and (max-height: 600px) and (hover: none) and (pointer: coarse)',
        },
      },
    },
  },
  plugins: [],
};
