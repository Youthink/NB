const path = require('path');

module.exports = {
  entry: './app.js',
  output: {
    filename: 'renderer.js'
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: ['env', 'react'],
            }
          }
        ]
      }
    ]
  }
};
