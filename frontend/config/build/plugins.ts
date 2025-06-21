import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type { WebpackPluginInstance } from 'webpack';
import webpack from 'webpack';

import { BuildOptions } from './types';

export function buildPlugins(options: BuildOptions): WebpackPluginInstance[] {
  const { paths, isDev } = options;

  const plugins: WebpackPluginInstance[] = [
    new HtmlWebpackPlugin({
      template: paths.html,
      inject: true,
      ...(!isDev && {
        minify: {
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
        },
      }),
    }),
    new webpack.ProgressPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        isDev ? 'development' : 'production'
      ),

      ...Object.keys(process.env)
        .filter(key => key.startsWith('REACT_APP_'))
        .reduce((env, key) => {
          env[`process.env.${key}`] = JSON.stringify(process.env[key]);
          return env;
        }, {} as Record<string, string>),
    }),
  ];

  if (!isDev) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }) as webpack.WebpackPluginInstance
    );
  }

  return plugins;
}
