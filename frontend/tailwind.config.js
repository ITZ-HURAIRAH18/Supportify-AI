/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0A0A0A',
          surface: '#111111',
          card: '#1A1A1A',
          hover: '#222222',
        },
        border: {
          DEFAULT: '#2A2A2A',
          hover: '#3A3A3A',
        },
        accent: {
          DEFAULT: '#F97316',
          hover: '#EA6C0A',
          muted: {
            bg: '#1C1008',
            text: '#FB923C'
          },
          glow: '#7C3A0A',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A1A1AA',
          muted: '#71717A',
          inverse: '#0A0A0A',
        },
        status: {
          success: { DEFAULT: '#22C55E', bg: '#0A1F0A', text: '#4ADE80' },
          warning: { DEFAULT: '#F59E0B', bg: '#1C1508', text: '#FCD34D' },
          danger: { DEFAULT: '#EF4444', bg: '#1F0A0A', text: '#F87171' },
          info: { DEFAULT: '#3B82F6', bg: '#080F1C', text: '#93C5FD' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'full': '9999px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
