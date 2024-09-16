import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from '../store/auth-store';
import { Inter_700Bold, Inter_400Regular, useFonts } from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, loadToken } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await loadToken();

        if (fontsLoaded) {
          setAppIsReady(true); // Indica que o app está pronto
          await SplashScreen.hideAsync(); // Esconde a splash screen
        }
      } catch (error) {
        console.warn(error);
      }
    };

    prepareApp();
  }, [fontsLoaded]);

  useEffect(() => {
    // Navega apenas se o app estiver pronto e as fontes carregadas
    if (appIsReady) {
      if (!isAuthenticated && segments[1] !== 'intro') {
        router.replace('/intro');
      } else if (isAuthenticated && segments[1] !== 'dashboard') {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated]);

  // Enquanto o app não está pronto, não renderiza nada (mantém a splash screen)
  if (!appIsReady) {
    return null; 
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView className="flex-1">
        <Slot />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
