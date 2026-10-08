import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { BarChart3, Map, User } from 'lucide-react-native';
import { Palette } from '../../theme/tokens';

export default function GestorLayout() {
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
        tabBarActiveTintColor: Palette.primary,
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
          title: 'Supervisão Municipal',
          tabBarLabel: 'Painel Gestor',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Equipes em Campo',
          tabBarLabel: 'Radar Mapa',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil do Gestor',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
