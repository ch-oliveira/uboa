import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useNetworkStore } from '../stores/network-store';
import { Palette } from '../theme/tokens';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, activeRole } = useAuthStore();
  const refreshPendingCount = useNetworkStore((s) => s.refreshPendingCount);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (activeRole === 'GESTOR' || activeRole === 'ADMIN') {
        router.replace('/(gestor)');
      } else {
        router.replace('/(tecnico)');
      }
    }
  }, [isAuthenticated, activeRole, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Palette.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(tecnico)" />
        <Stack.Screen name="(gestor)" />
      </Stack>
    </QueryClientProvider>
  );
}
