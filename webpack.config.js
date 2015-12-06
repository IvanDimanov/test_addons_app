/* global require */
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './frontend-app/index.js',
  output: {
    path: './frontend-app/public/assets',
    filename: 'bundle.js'
  },

  cache: false,
  clearBeforeBuild: true,

  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel']
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style', 'css!sass')
    }]
  },
  plugins: [
    new ExtractTextPlugin('bundle.css')
  ]
}
