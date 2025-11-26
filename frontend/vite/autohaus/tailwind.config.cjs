/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  safelist: [
    'text-cms-primary',
    'text-cms-dark',
    'bg-cms-primary',
    'bg-cms-dark',
    'bg-cms-primary-hover',
    'bg-cms-primary-light',
    'border-cms-primary',
    'border-cms-primary-hover',
    'hover:bg-cms-primary',
    'hover:bg-cms-primary-hover',
    'hover:bg-cms-primary-light',
  ],
  theme: {
    extend: {
      colors: {
        'cms-dark': '#010038',
        'cms-primary': '#48B5FF',
        'cms-accent': '#F58533',
        'cms-primary-hover': '#3AA0E8',
        'cms-primary-light': '#E8F4FD',
      }
    },
  },
  plugins: [],
}
