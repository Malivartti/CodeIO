import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { ResolveOptions } from 'webpack';

import { BuildOptions } from './types';

export function buildResolvers({ paths }: BuildOptions): ResolveOptions {
  return {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(paths.root, 'tsconfig.json'),
      }),
    ],
    alias: {
      '@app': path.resolve(paths.src, 'app'),
      '@pages': path.resolve(paths.src, 'pages'),
      '@widgets': path.resolve(paths.src, 'widgets'),
      '@features': path.resolve(paths.src, 'features'),
      '@entities': path.resolve(paths.src, 'entities'),
      '@shared': path.resolve(paths.src, 'shared'),
    },
  };
}
