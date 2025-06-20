import { RuleSetRule } from 'webpack';


export function svgLoader(): RuleSetRule {
  return {
    test: /\.svg$/,
    oneOf: [
      {
        resourceQuery: /url/,
        type: 'asset/resource',
      },
      {
        issuer: /\.[jt]sx?$/,
        use: [{
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
            icon: true,
            dimensions: false,
          },
        }],
      },
    ],
  };
}
