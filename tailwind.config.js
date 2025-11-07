/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2563eb',
          dark: '#60a5fa',
          hover: '#1d4ed8',
        },
        background: {
          light: '#ffffff',
          dark: '#0a0f1e',
        },
        text: {
          light: '#111827',
          dark: '#f8fafc',
          secondary: '#6b7280',
        },
        border: {
          light: '#e5e7eb',
          dark: '#2d3748',
        },
      },
    },
  },
  plugins: [],
}

