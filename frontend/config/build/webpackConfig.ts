import webpack from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

import { buildDevServer } from './devServer';
import { buildLoaders } from './loaders';
import { buildPlugins } from './plugins';
import { buildResolvers } from './resolvers';
import { BuildOptions } from './types';

interface Configuration extends webpack.Configuration {
  devServer?: DevServerConfiguration;
}

export function buildWebpackConfig(options: BuildOptions): Configuration {
  const { paths, mode, isDev } = options;

  return {
    mode,
    entry: paths.entry,

    output: {
      path: paths.build,
      filename: isDev
        ? 'static/js/[name].js'
        : 'static/js/[name].[contenthash:8].js',
      chunkFilename: isDev
        ? 'static/js/[name].chunk.js'
        : 'static/js/[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      clean: true,
      publicPath: paths.publicPath,
    },

    resolve: buildResolvers(options),
    module: {
      rules: buildLoaders(options),
    },
    plugins: buildPlugins(options),

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },

    devServer: isDev ? buildDevServer(options) : undefined,
    devtool: isDev ? 'source-map' : undefined,
  };
}
