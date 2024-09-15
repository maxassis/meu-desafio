import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from "../store/auth-store";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, loadToken, logout } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadToken();
    logout()
  }, []);

  useEffect(() => {
    if (!isAuthenticated && segments[1] !== 'intro') {
      router.replace('/intro');
    } else if (isAuthenticated && segments[1] !== 'dashboard') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}