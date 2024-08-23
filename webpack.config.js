const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: './src/index.js', // Entry point of your application
    output: {
      path: path.resolve(__dirname, 'dist'), // Output directory
      filename: 'bundle-es.js', // Output file name for ES6
      libraryTarget: 'amd'
    },
    mode: 'production',
    optimization: {
      minimizer: [new TerserPlugin({
        extractComments: false,
      })],
    },
    externals: {
      // Specify the external packages you want to exclude from the bundle
      'slate': 'slate'
    }
  },
  {
    entry: './src/index.js', // Entry point of your application
    output: {
      path: path.resolve(__dirname, 'dist'), // Output directory
      filename: 'bundle-cjs.js', // Output file name for CommonJS
      libraryTarget: 'commonjs'
    },
    mode: 'production',
    optimization: {
      minimizer: [new TerserPlugin({
        extractComments: false,
      })],
    },
    externals: {
      // Specify the external packages you want to exclude from the bundle
      'slate': 'slate'
    }
  }
];