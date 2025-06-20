import { RuleSetRule } from 'webpack';

import { cssLoader as BuildCssLoader } from './loaders/cssLoader';
import { svgLoader as BuildSvgLoader } from './loaders/svgLoader';
import { BuildOptions } from './types';

export function buildLoaders(options: BuildOptions): RuleSetRule[] {
  const { isDev } = options;

  const typescriptLoader: RuleSetRule = {
    test: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: isDev,
      },
    },
  };

  const cssLoader = BuildCssLoader(isDev);
  const svgLoader = BuildSvgLoader();

  const fontsLoader: RuleSetRule = {
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    type: 'asset/resource',
    generator: {
      filename: 'static/fonts/[name].[hash][ext]',
    },
  };

  const imagesLoader: RuleSetRule = {
    test: /\.(png|jpg|jpeg|gif|webp|avif)$/,
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 8 * 1024,
      },
    },
  };

  return [
    typescriptLoader,
    cssLoader,
    svgLoader,
    fontsLoader,
    imagesLoader,
  ];
}
