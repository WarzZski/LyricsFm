import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ef5a2f',
        tabBarInactiveTintColor: '#bbb0a9',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 18,
          fontWeight: '800',
          marginTop: 4,
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 4,
          borderTopWidth: 0,
          backgroundColor: '#fff',
          shadowColor: '#1f1a17',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bookmark.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
