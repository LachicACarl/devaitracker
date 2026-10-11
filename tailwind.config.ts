import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        canvas: '#f8fafc',
        sidebar: '#111827',
        accent: '#2563eb',
      },
    },
  },
  plugins: [],
} satisfies Config;
