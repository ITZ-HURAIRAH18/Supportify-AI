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
          base: '#12110d',
          surface: '#1a1813',
          card: '#22201a',
          hover: '#2a2720',
        },
        border: {
          DEFAULT: 'rgba(242, 241, 237, 0.12)',
          hover: 'rgba(242, 241, 237, 0.24)',
          strong: 'rgba(242, 241, 237, 0.48)',
        },
        accent: {
          DEFAULT: '#f54e00',
          hover: '#cf2d56',
          muted: {
            bg: 'rgba(245, 78, 0, 0.14)',
            text: '#ffb08a'
          },
          glow: 'rgba(245, 78, 0, 0.22)',
        },
        text: {
          primary: '#f2f1ed',
          secondary: 'rgba(242, 241, 237, 0.82)',
          muted: 'rgba(242, 241, 237, 0.58)',
          inverse: '#12110d',
        },
        status: {
          success: { DEFAULT: '#43b98f', bg: 'rgba(31, 138, 101, 0.2)', text: '#77d7b4' },
          warning: { DEFAULT: '#d5a05b', bg: 'rgba(192, 133, 50, 0.2)', text: '#edc48f' },
          danger: { DEFAULT: '#e06586', bg: 'rgba(207, 45, 86, 0.2)', text: '#f3a4bb' },
          info: { DEFAULT: '#9fbbe0', bg: 'rgba(159, 187, 224, 0.18)', text: '#c7d7ef' },
        }
      },
      fontFamily: {
        sans: ['CursorGothic', 'Space Grotesk', 'system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'Arial'],
        display: ['CursorGothic', 'Space Grotesk', 'system-ui', 'Helvetica Neue', 'Arial'],
        editorial: ['jjannon', 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', 'P052', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times'],
        code: ['berkeleyMono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New'],
      },
      spacing: {
        '1.5': '6px',
        '2.5': '10px',
        '3.5': '14px',
        '5.5': '22px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '10px',
        'full': '9999px',
        'pill': '33554432px',
      },
      boxShadow: {
        card: 'rgba(0,0,0,0.45) 0px 28px 70px, rgba(0,0,0,0.3) 0px 14px 32px, rgba(242,241,237,0.08) 0px 0px 0px 1px',
        ambient: 'rgba(0,0,0,0.24) 0px 0px 16px, rgba(0,0,0,0.12) 0px 0px 8px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
