const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  plugins: process.env.NODE_ENV === 'production' ? [
    new UglifyJsPlugin()
  ] : [],
  output: {
    filename: process.env.NODE_ENV === 'production' ? 'react-craft-ai-decision-tree.min.js' : 'react-craft-ai-decision-tree.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'DecisionTree',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  }
};
