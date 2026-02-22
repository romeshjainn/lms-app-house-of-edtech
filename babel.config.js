module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      'nativewind/babel',
      'babel-preset-expo',
    ],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@': './src',
          },
        },
      ],
      require.resolve('expo-router/babel'),
      'react-native-reanimated/plugin',
    ],
  };
};
