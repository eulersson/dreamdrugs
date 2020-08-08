const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');
const path = require('path');
const webpack = require('webpack');

module.exports = function(env, argv) {
  // Reduce all the variables in the frontend/.env file into an object.
  //
  //   Source: https://medium.com/@trekinbami/using-environment-variables-in-react-6b0a99d83cf5
  //
  const environ = dotenv.config().parsed;
  const envKeys = Object.keys(environ).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(environ[next]);
    return prev;
  }, {});

 return {
    mode: 'development',
    entry: [
      'webpack-hot-middleware/client',
      'react-hot-loader/patch',
      './src/client'
    ],
    devtool: 'inline-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loaders: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ] 
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      new webpack.EnvironmentPlugin(['BACKEND_DOMAIN']),
      new HtmlWebpackPlugin({
        template: 'src/server/views/index.html',
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
}
