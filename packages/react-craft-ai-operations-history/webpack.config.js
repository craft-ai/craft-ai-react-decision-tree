const path = require('path');

const MODE =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  entry: './src/index.js',
  mode: MODE,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          rootMode: 'upward'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  output: {
    filename:
      MODE === 'production'
        ? 'react-craft-ai-operations-history.min.js'
        : 'react-craft-ai-operations-history.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'OperationsHistory',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
