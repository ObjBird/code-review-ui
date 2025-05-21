// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const envPath = isProduction ? './.env.production' : './.env.development';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'static/js/[name].[contenthash:8].js',
      publicPath: '/',
      // 添加'static'文件夹使输出结构更清晰
      assetModuleFilename: 'static/media/[name].[hash][ext]',
    },
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        // favicon选项已移除
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            }
          : false,
      }),
      new Dotenv({
        path: envPath,
        systemvars: true, // 加载所有系统环境变量
      }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      isProduction &&
        new CopyPlugin({
          patterns: [
            { 
              from: 'public',
              to: '',
              globOptions: {
                ignore: ['**/index.html'],
              },
            },
            { from: '_redirects', to: '', noErrorOnMissing: true },
          ],
        }),
    ].filter(Boolean),
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`,
      },
    },
    devServer: {
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true,
      // 代理配置，开发环境将'/api'请求转发到Worker URL
      proxy: {
        '/api': {
          target: 'https://ccc.zhanglong116033.workers.dev/',
          pathRewrite: { '^/api': '' },
          changeOrigin: true
        }
      }
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxAssetSize: 512000, // 500 KiB
      maxEntrypointSize: 512000, // 500 KiB
    },
  };
};