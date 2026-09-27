/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

module.exports = {
  content: [
    './_drafts/*.html',
    './_includes/*.html',
    './_layouts/*.html',
    './_posts/*.md',
    './*.md',
    './*.html',
  ],
  theme: {
    fontFamily: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: token('brand'),
          strong: token('brand-strong'),
        },
        highlight: token('highlight'),
        accent: {
          DEFAULT: token('accent'),
          strong: token('accent-strong'),
        },
        leaf: token('leaf'),
        ink: token('ink'),
        surface: {
          DEFAULT: token('surface'),
          sunken: token('surface-sunken'),
          raised: token('surface-raised'),
        },
      },
      maxWidth: {
        prose: 'var(--measure)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },
      zIndex: {
        nav: 'var(--z-nav)',
        skip: 'var(--z-skip)',
      },
    },
  },
  corePlugins: {
    container: false
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.container': {
          width: '100%',
          marginInline: 'auto',
          paddingInline: '1.25rem',
          '@screen sm': {
            maxWidth: '640px',
          },
          '@screen md': {
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1280px',
          },
        }
      })
    }
  ]
}
