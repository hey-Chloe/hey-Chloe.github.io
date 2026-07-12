import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moss: '#315b3c',
        mossDark: '#16311f',
        mossMid: '#4d7a54',
        fog: '#d7dfcf',
        paper: '#f4f0e5',
        paperDeep: '#d7dec8',
        ink: '#172118',
        burgundy: '#7f3f36',
        sage: '#96a98c',
        blackDesk: '#050605'
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
        sans: ['Arial', 'Helvetica', 'sans-serif']
      },
      boxShadow: {
        paper: '0 22px 52px rgba(8, 18, 11, 0.38)',
        object: '0 18px 40px rgba(8, 18, 11, 0.32)',
        glow: '0 0 38px rgba(218, 230, 195, 0.28)'
      }
    }
  },
  plugins: []
};

export default config;
