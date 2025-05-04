// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo',{
//       // Habilita a transformação de `import.meta`
//       unstable_transformImportMeta: true,
//     }],
//     plugins: [
//       "nativewind/babel",
//       ["module:react-native-dotenv", {
//         "moduleName": "@env",
//         "path": ".env",
//         "blacklist": null,
//         "whitelist": null,
//         "safe": false,
//         "allowUndefined": true
//       }]
//     ]
//   };
// };

module.exports = function (api) {
  api.cache(true);
  return {
    // ✅ Preset com opções precisa estar em um array próprio
    presets: [
      ['babel-preset-expo', {
        unstable_transformImportMeta: true,
      }],
    ],
    plugins: [
      'nativewind/babel',
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      }],
    ],
  };
};