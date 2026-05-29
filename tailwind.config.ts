import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx}',
    './stores/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1180px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-rounded', 'system-ui', 'sans-serif'],
        soft: ['Inter', 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', 'ui-rounded', 'sans-serif']
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        sakura: {
          50: '#fff7fb',
          100: '#ffe7f3',
          200: '#ffcce7',
          300: '#ffa4d4',
          400: '#fb72b7',
          500: '#ee4c9e',
          600: '#d72b7f'
        },
        lavender: {
          50: '#f8f5ff',
          100: '#eee7ff',
          200: '#dfd3ff',
          300: '#c8afff',
          400: '#aa80ff',
          500: '#8d55f7',
          600: '#7337dc'
        },
        cyber: {
          blue: '#92ddff',
          violet: '#b69bff',
          pink: '#ff9ad8'
        }
      },
      boxShadow: {
        soft: '0 20px 80px rgba(156, 115, 255, 0.18)',
        glow: '0 0 45px rgba(255, 145, 210, 0.38)',
        card: '0 18px 50px rgba(94, 60, 160, 0.12)'
      },
      backgroundImage: {
        'sakura-radial': 'radial-gradient(circle at top left, rgba(255, 161, 217, 0.38), transparent 34%), radial-gradient(circle at 80% 20%, rgba(146, 221, 255, 0.35), transparent 32%), linear-gradient(135deg, #fff7fb 0%, #f7f2ff 40%, #eef8ff 100%)',
        'pastel-glow': 'linear-gradient(135deg, rgba(255, 156, 214, 0.75), rgba(180, 155, 255, 0.78), rgba(146, 221, 255, 0.75))'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        particle: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0.25' },
          '50%': { opacity: '0.85' },
          '100%': { transform: 'translate3d(20px, -70px, 0) scale(1.3)', opacity: '0' }
        }
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
        particle: 'particle 8s ease-in-out infinite'
      }
    }
  },
  plugins: [typography, animate]
}

export default config
