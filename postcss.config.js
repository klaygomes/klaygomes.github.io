module.exports = {
  plugins: [
    require('postcss-import')({
      path: ['./assets/css']
    }),
    require('tailwindcss'),
    require('autoprefixer'),
    ...(process.env.NODE_ENV == 'production'
      ? [require('cssnano')({ preset: 'default' })]
      : [])
  ]
}