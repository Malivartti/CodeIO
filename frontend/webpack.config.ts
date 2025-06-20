import path from 'path';
import webpack from 'webpack';

import { BuildArgv, BuildMode, BuildPaths } from './config/build/types';
import { buildWebpackConfig } from './config/build/webpackConfig';

export default (env: unknown, argv: BuildArgv) => {
  const paths: BuildPaths = {
    root: path.resolve(__dirname),
    entry: path.resolve(__dirname, 'src', 'main.tsx'),
    build: path.resolve(__dirname, 'dist'),
    html: path.resolve(__dirname, 'index.html'),
    src: path.resolve(__dirname, 'src'),
    publicPath: argv.publicPath ?? '/',
  };

  const mode: BuildMode = argv.mode || 'development';
  const isDev = mode === 'development';
  const port = argv.port || 3000;

  const config: webpack.Configuration = buildWebpackConfig({
    mode,
    paths,
    isDev,
    port,
  });

  return config;
};
