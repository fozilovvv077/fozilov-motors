import type { Config } from 'tailwindcss';

const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('--bg'),
        fg: c('--fg'),
        card: c('--card'),
        muted: c('--muted'),
        line: c('--line'),
        accent: c('--accent'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        road: { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '-160px 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        shine: { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },
      },
      animation: {
        road: 'road 1.2s linear infinite',
        float: 'float 7s ease-in-out infinite',
        shine: 'shine 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
