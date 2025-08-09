const webpack = require('webpack');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      bcrypt: 'commonjs bcrypt',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@nestjs/microservices',
            '@nestjs/microservices/microservices-module',
            'cache-manager',
            'class-validator',
            'class-transformer',
            'mock-aws-s3',
            'aws-sdk',
            'nock',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};
