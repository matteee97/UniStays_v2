/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0.7', transform: 'scale(0.75)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bumpLeft: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-35%)' },
        },
        bumpRight: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(35%)' },
        },
          'star-movement-bottom': {
           '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
           '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
         },
         'star-movement-top': {
            '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
            '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
         },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out forwards',
        bumpLeft: 'bumpLeft 0.7s ease-in-out',
        bumpRight: 'bumpRight 0.7s ease-in-out',
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
      },
      screens: {
        '3xl': '1792px', // breakpoint personalizzato
      },
      transitionTimingFunction: {
        'smooth-in-out': 'cubic-bezier(0.7, 0, 0.3, 1)', // cinematico
      },
    },
  },
  plugins: [],
}
