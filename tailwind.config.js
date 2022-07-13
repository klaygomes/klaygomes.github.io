/** @type {import('tailwindcss').Config} */
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
      rubik: ['Rubik', 'sans-serif'],
      abel: ['Abel', 'sans-serif'],
      molengo: ['Molengo', 'sans-serif'],
    },
    extend: {
      colors: {
        backgroundColor: '#FDFDFD',
        primaryColor: '#7E23B3',
        primaryColorDarker: '#480F7B',
        bgContrastColor: '#FAD30B',
        textColor: '#25063C',
        textContrastColor: '#C63F75',
        textContrastColorDarker: '#B61A54',
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
