import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import useAuthStore from "../store/auth-store";

export default function RootLayout() {
  const { isAuthenticated, loadToken } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Carrega o token do AsyncStorage ao iniciar o aplicativo
    loadToken();
  }, []);

  useEffect(() => {
    // Protege as rotas com base no estado de autenticação
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, segments, router]);

  return <Slot />;
}