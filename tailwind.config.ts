import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  safelist: [
    { pattern: /bg-(red|green|blue|yellow|purple|pink|orange|teal|cyan|indigo)-(400|500|600|700|800)/ },
    { pattern: /from-(red|green|blue|yellow|purple|pink|orange|teal|cyan|indigo)-(400|500|600|700|800)/ },
    { pattern: /to-(red|green|blue|yellow|purple|pink|orange|teal|cyan|indigo)-(400|500|600|700|800)/ },
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          50:  '#e8f5e0',
          100: '#c8eab2',
          200: '#a5df80',
          300: '#80d44e',
          400: '#62cb2a',
          500: '#1DB954',
          600: '#18a34a',
          700: '#12883e',
          800: '#0c6d32',
          900: '#055226',
          DEFAULT: '#1DB954',
          hover: '#1ed760',
          press: '#169c46',
        },
        bg: {
          base:      '#121212',
          elevated:  '#1a1a1a',
          highlight: '#282828',
          press:     '#000000',
          tinted:    '#1f1f1f',
        },
        surface: {
          100: '#1a1a1a',
          200: '#242424',
          300: '#2a2a2a',
          400: '#303030',
          500: '#3a3a3a',
          600: '#444444',
          elevated: '#282828',
          tinted:   '#1f1f1f',
        },
        text: {
          base:    '#FFFFFF',
          subdued: '#A7A7A7',
          negative:'#F15E6C',
          warning: '#e9841a',
          positive:'#1DB954',
        },
      },
      fontFamily: {
        circular: ['CircularStd', 'DM Sans', 'Inter', ...fontFamily.sans],
        sans:     ['CircularStd', 'DM Sans', 'Inter', ...fontFamily.sans],
      },
      fontSize: {
        'spotify-xs':   ['0.6875rem', { lineHeight: '1rem' }],
        'spotify-sm':   ['0.75rem',   { lineHeight: '1rem' }],
        'spotify-base': ['0.875rem',  { lineHeight: '1.25rem' }],
        'spotify-md':   ['1rem',      { lineHeight: '1.5rem' }],
        'spotify-lg':   ['1.125rem',  { lineHeight: '1.75rem' }],
        'spotify-xl':   ['1.5rem',    { lineHeight: '2rem' }],
        'spotify-2xl':  ['2rem',      { lineHeight: '2.5rem' }],
        'spotify-3xl':  ['3rem',      { lineHeight: '3.5rem' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '88':  '22rem',
        '104': '26rem',
        '120': '30rem',
      },
      borderRadius: {
        'spotify':      '4px',
        'spotify-md':   '8px',
        'spotify-lg':   '12px',
        'spotify-full': '9999px',
      },
      boxShadow: {
        'spotify-sm':     '0 2px 4px rgba(0,0,0,0.5)',
        'spotify-md':     '0 8px 24px rgba(0,0,0,0.5)',
        'spotify-lg':     '0 16px 48px rgba(0,0,0,0.5)',
        'spotify-player': '0 -2px 10px rgba(0,0,0,0.5)',
        'spotify-hover':  '0 8px 20px rgba(0,0,0,0.6)',
        'spotify-focus':  '0 0 0 3px rgba(29,185,84,0.5)',
      },
      keyframes: {
        'spotify-fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'equalizer': {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(29,185,84,0.4)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(29,185,84,0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'context-menu-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95) translateY(-5px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'spotify-fade-in': 'spotify-fade-in 0.3s ease-out',
        'equalizer':       'equalizer 0.8s ease-in-out infinite',
        'shimmer':         'shimmer 1.5s linear infinite',
        'spin-slow':       'spin-slow 20s linear infinite',
        'pulse-green':     'pulse-green 2s ease-in-out infinite',
        'slide-up':        'slide-up 0.3s ease-out',
        'context-menu-in': 'context-menu-in 0.15s ease-out',
      },
      screens: {
        xs:           '375px',
        'spotify-sm': '640px',
        'spotify-md': '1024px',
        'spotify-lg': '1400px',
      },
      gridTemplateColumns: {
        'song-row':       '16px 4fr 2fr 1fr',
        'song-row-album': '16px 4fr 2fr 2fr 1fr',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addBase, addComponents, addUtilities, theme }: any) {
      addBase({
        ':root': {
          '--spotify-green':     theme('colors.spotify.DEFAULT'),
          '--spotify-hover':     theme('colors.spotify.hover'),
          '--spotify-bg':        theme('colors.bg.base'),
          '--spotify-surface':   theme('colors.surface.elevated'),
          '--spotify-text':      theme('colors.text.base'),
          '--spotify-text-sub':  theme('colors.text.subdued'),
          '--player-height':     '90px',
          '--sidebar-width':     '240px',
          '--topbar-height':     '64px',
        },
      });

      addComponents({
        '.spotify-scrollbar': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent',
          '&::-webkit-scrollbar':             { width: '8px' },
          '&::-webkit-scrollbar-track':       { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background:   'rgba(255,255,255,0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255,255,255,0.4)' },
        },
        '.spotify-card': {
          backgroundColor: theme('colors.surface.elevated'),
          borderRadius:    theme('borderRadius.spotify-md'),
          padding:         theme('spacing.4'),
          transition:      'background-color 0.2s ease',
          cursor:          'pointer',
          '&:hover': { backgroundColor: theme('colors.surface.400') },
        },
        '.btn-spotify-primary': {
          display:         'inline-flex',
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: theme('colors.spotify.DEFAULT'),
          color:           '#000',
          fontWeight:      '700',
          borderRadius:    theme('borderRadius.spotify-full'),
          padding:         '14px 32px',
          fontSize:        '0.875rem',
          letterSpacing:   '0.05em',
          transition:      'all 0.1s ease',
          '&:hover': {
            backgroundColor: theme('colors.spotify.hover'),
            transform:       'scale(1.04)',
          },
          '&:active': {
            backgroundColor: theme('colors.spotify.press'),
            transform:       'scale(0.98)',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor:  'not-allowed',
            transform: 'none',
          },
        },
        '.btn-spotify-ghost': {
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          color:           theme('colors.text.base'),
          border:          '1px solid rgba(255,255,255,0.3)',
          borderRadius:    theme('borderRadius.spotify-full'),
          padding:         '7px 15px',
          fontSize:        '0.875rem',
          fontWeight:      '700',
          transition:      'all 0.15s ease',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.7)',
            transform:   'scale(1.04)',
          },
        },
        '.now-playing-bar': {
          backgroundColor: '#181818',
          borderTop:       '1px solid rgba(255,255,255,0.1)',
          height:          'var(--player-height)',
        },
        '.card-hover-reveal': {
          '& .reveal-on-hover': { opacity: '0', transform: 'translateY(8px)', transition: 'all 0.2s ease' },
          '&:hover .reveal-on-hover': { opacity: '1', transform: 'translateY(0)' },
        },
      });

      addUtilities({
        '.no-tap-highlight':        { '-webkit-tap-highlight-color': 'transparent' },
        '.will-change-transform':   { willChange: 'transform' },
        '.truncate-2': {
          display:             '-webkit-box',
          '-webkit-line-clamp':'2',
          '-webkit-box-orient':'vertical',
          overflow:            'hidden',
        },
        '.truncate-3': {
          display:             '-webkit-box',
          '-webkit-line-clamp':'3',
          '-webkit-box-orient':'vertical',
          overflow:            'hidden',
        },
        '.text-spotify-green':  { color:           theme('colors.spotify.DEFAULT') },
        '.bg-spotify-green':    { backgroundColor: theme('colors.spotify.DEFAULT') },
        '.bg-spotify-base':     { backgroundColor: theme('colors.bg.base') },
      });
    },
  ],
};

export default config;
