/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        panda: {
          yellow: '#F6D86B',
          dark: '#141827',
          paper: '#F5F1E8',
          paperLight: '#F8F5EF',
          surface: '#FFFFFF',
          muted: '#F0EBE0',
          sage: '#C8D4CF',
          red: '#E54D2E',
          green: '#10B981',
        },
      },
      boxShadow: {
        'tactile-sm': '0 2px 0 #141827',
        tactile: '0 3px 0 #141827',
        'tactile-lg': '0 5px 0 #141827',
        'tactile-xl': '0 8px 0 #141827',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
