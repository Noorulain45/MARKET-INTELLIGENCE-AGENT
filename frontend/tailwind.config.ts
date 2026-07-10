import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Extended pink/glitter palette for direct use in components
        pink: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        rose: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        glitter: {
          pink:   'hsl(var(--glitter-1))',
          purple: 'hsl(var(--glitter-2))',
          blush:  'hsl(var(--glitter-3))',
          gold:   'hsl(var(--glitter-gold))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'pink-shimmer':
          'linear-gradient(115deg, hsl(330 80% 65%), hsl(310 90% 70%), hsl(45 100% 70%), hsl(350 100% 80%), hsl(330 80% 65%))',
        'pink-glow':
          'radial-gradient(ellipse at center, hsl(330 80% 65% / 0.25) 0%, transparent 70%)',
        'glitter-radial':
          'radial-gradient(circle at 30% 20%, hsl(330 100% 75% / 0.3), transparent 50%), radial-gradient(circle at 70% 80%, hsl(310 90% 70% / 0.2), transparent 50%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        // Glitter shimmer sweep across an element
        'glitter-sweep': {
          '0%':   { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-100% 50%' },
        },
        // Shimmer text gradient move
        'shimmer-move': {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '300% 50%' },
        },
        // Floating sparkle scale pulse
        'sparkle': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1'   },
          '50%':      { transform: 'scale(1.4)', opacity: '0.6' },
        },
        // Gentle glow border pulse
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 6px hsl(330 80% 65% / 0.4)'  },
          '50%':      { boxShadow: '0 0 18px hsl(330 80% 65% / 0.75)' },
        },
        // Soft float up/down
        'float': {
          '0%, 100%': { transform: 'translateY(0px)'   },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'pulse-slow':      'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitter-sweep':   'glitter-sweep 3s linear infinite',
        'shimmer-move':    'shimmer-move 4s linear infinite',
        'sparkle':         'sparkle 2s ease-in-out infinite',
        'sparkle-delayed': 'sparkle 2s ease-in-out 1s infinite',
        'glow-pulse':      'glow-pulse 2.5s ease-in-out infinite',
        'float':           'float 4s ease-in-out infinite',
      },
      dropShadow: {
        'pink':       '0 0 8px hsl(330 80% 65% / 0.6)',
        'pink-lg':    '0 0 20px hsl(330 80% 65% / 0.5)',
        'glitter':    '0 0 6px hsl(45 100% 70% / 0.7)',
      },
      boxShadow: {
        'pink-glow':    '0 0 16px hsl(330 80% 65% / 0.35), 0 4px 24px hsl(330 80% 65% / 0.15)',
        'pink-glow-lg': '0 0 32px hsl(330 80% 65% / 0.5), 0 8px 40px hsl(330 80% 65% / 0.25)',
        'inner-pink':   'inset 0 0 12px hsl(330 80% 65% / 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
