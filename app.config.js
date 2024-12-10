export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    name: "meu-desafio2",
    android: {
      ...config.expo?.android,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    ios: {
      ...config.expo?.ios,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  }
});
