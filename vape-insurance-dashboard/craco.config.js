module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress source map warnings from node_modules
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ];
      
      return webpackConfig;
    },
  },
};
