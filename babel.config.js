module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        alias: {
          'crypto': 'react-native-crypto',
          'stream': 'stream-browserify',
          'buffer': '@craftzdog/react-native-buffer',
        },
      }],
    ],
  };
}; 