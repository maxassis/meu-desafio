import 'dotenv/config';

export default {
  expo: {
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.maxassis.bondis-app",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Este app precisa da sua localização para mostrar sua posição no mapa",
        NSLocationAlwaysUsageDescription: "Este app precisa da sua localização para mostrar sua posição no mapa",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Este app precisa da sua localização para mostrar sua posição no mapa"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      package: "com.maxassis.meudesafio2",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "230cd5ae-e636-4f24-a992-74172495dd48"
      }
    }
  }
};
