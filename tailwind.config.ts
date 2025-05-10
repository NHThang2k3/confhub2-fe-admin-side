import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1440px'
      }
    },
    extend: {
      backgroundImage: {
        'span-bg': 'var(--span-bg)'
      },
      colors: {
        background: 'var(--background)',
        primary: {
          DEFAULT: 'var(--primary)'
        },
        neutral: {
          DEFAULT: 'var(--neutral)',
          30: 'var(--Neutral-30)',
          80: 'var(--Neutral-80)',
          20: 'var(--Neutral-20)'
        },
        'button-secondary': 'var(--button-secondary)',
        'button-text': 'var(--button-text)',
        'text-secondary': 'var(--text-secondary)',
        'background-secondary': 'var(--background-secondary)',
        secondary: 'var(--secondary)',
        button: 'var(--button)',
        selected: 'var(--selected)',
        dropdown: 'var(--dropdown)',
        dropdownHover: 'var(--dropdown-hover)',
        buttonSecondary: 'var(--button-secondary)',
        'white-pure':'var(--white-pure)', 
        'black-pure':'var(--black-pure)', 
        'gray-5':'var(--gray-5)', 
        'gray-10':'var(--gray-10)', 
        'gray-20':'var(--gray-20)', 
        'gray-30':'var(--gray-30)', 
        'gray-40':'var(--gray-40)', 
        'gray-50':'var(--gray-50)', 
        'gray-60':'var(--gray-60)', 
        'gray-70':'var(--gray-70)', 
        'gray-80':'var(--gray-80)', 
        'gray-90':'var(--gray-90)', 
        'gray-95':'var(--gray-95)', 




      },

      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'var(--rubik)']
      },
      keyframes: {
        ripple: { // Keep the original ripple for button hover if uncommented
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'pulse-ripple': { // New continuous pulse ripple animation
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '50%': { transform: 'scale(1.2)', opacity: '0.2' }, // Scale up and slightly fade
          '100%': { transform: 'scale(1.5)', opacity: '0' },   // Scale further and fully fade
        },
        'floatUpDown': { // Tên keyframes animation
          '0%, 100%': { transform: 'translateY(0)' }, // Vị trí ban đầu và cuối
          '50%': { transform: 'translateY(-20px)' }, // Vị trí ở giữa (di chuyển lên)
        },
        hover: {
          from: {
            transform: 'translateY(0)'
          },
          to: {
            transform: 'translateY(-3.5px)'
          }
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        ripple: 'ripple 0.5s ease-out', // Animation for button hover (if used)
        'pulse-ripple': 'pulse-ripple 1s linear infinite', // Continuous pulse ripple for div
        'float-up-down': 'floatUpDown 2s ease-in-out infinite', // Định nghĩa animation sử dụng keyframes 'floatUpDown'
        hover: 'hover 1.4s infinite alternate ease-in-out',
        'scroll-left': 'scrollLeft var(--scroll-speed) linear infinite',
      },


    }
    // ,
    // corePlugins: {
    //   preflight: false
    // }
  },
  plugins: [require('tailwind-scrollbar'), require('tailwindcss-animate'), require('tailwind-scrollbar-hide')]

} satisfies Config

export default config
