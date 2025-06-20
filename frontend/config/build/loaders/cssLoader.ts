import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { RuleSetRule } from 'webpack';

export function cssLoader(isDev: boolean): RuleSetRule {
  return {
    test: /\.(scss|sass|css)$/,
    oneOf: [
      {
        test: /\.module\.(scss|sass|css)$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                namedExport: false,
                auto: (resPath: string) => Boolean(resPath.includes('.module.')),
                localIdentName: isDev
                  ? '[name]__[local]--[hash:base64:5]'
                  : '[hash:base64:5]',
              },
              importLoaders: 2,
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  };
}
