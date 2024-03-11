const path = require('path');
const rootDir = path.resolve(__dirname);

module.exports = ({ config, pkg, webpack }) => {
  const { BUILD_MODULE } = process.env;

  return {
    ...config,
    output: {
      ...config.output,
      filename: 'grapes.min.js',
      libraryExport: 'default',
    },
    devServer: {
      headers: { 'Access-Control-Allow-Origin': '*' },
      disableHostCheck: true,
    },
    resolve: {
      ...config.resolve,
      modules: [
        ...(config.resolve && config.resolve.modules),
        'src',
        'node_modules'
      ],
      alias: {
        ...(config.resolve && config.resolve.alias),
        jquery: 'utils/cash-dom',
        backbone: `${rootDir}/node_modules/backbone`,
        underscore: `${rootDir}/node_modules/underscore`,
      }
    },
    plugins: [
      new webpack.DefinePlugin({ __GJS_VERSION__: `'${pkg.version}'` }),
      ...config.plugins,
    ]
  }
};
