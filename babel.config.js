// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // For path aliases like `@/components/Button`
      ['module-resolver', {
        root: ['./src'], // Your source directory
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'], // Add TS extensions
      }],
      // Add other plugins here if needed
      ['react-native-reanimated/plugin'],
    ],
  };
};
