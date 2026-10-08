import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Wrench, Compass, CloudCheck, User } from 'lucide-react-native';
import { useNetworkStore } from '../../stores/network-store';
import { Palette } from '../../theme/tokens';

export default function TecnicoLayout() {
  const { pendingCount } = useNetworkStore();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Palette.surface,
          borderBottomColor: Palette.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Palette.primary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
          color: Palette.primary,
        },
        tabBarStyle: {
          backgroundColor: Palette.surface,
          borderTopColor: Palette.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
        tabBarActiveTintColor: Palette.accent,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Meus chamados',
          tabBarLabel: 'Chamados',
          tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="oportunidades"
        options={{
          title: 'Oportunidades na Região',
          tabBarLabel: 'Na Região',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: 'Sincronização Offline',
          tabBarLabel: 'Offline',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Palette.alta.badge,
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color, size }) => <CloudCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Meu Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="os/[id]"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
