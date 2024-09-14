import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import useAuthStore from "../store/auth-store";

export default function RootLayout() {
  const { isAuthenticated, loadToken, logout } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && segments[1] !== 'intro') {
      router.replace('/intro');
    } else if (isAuthenticated && segments[1] !== 'dashboard') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated]);

  return <Slot />;
}