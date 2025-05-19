// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelectionContext } from '@/contexts/SelectionContext';
import { useSegments } from 'expo-router';

export default function TabsLayout() {
  const { selectionMode } = useSelectionContext();
  const segments = useSegments();

  // Только если мы в админке
  const isAdminRoute = segments.join('/').includes('admin');

  return (
    <Tabs
      screenOptions={{
        // Скрываем табы, если включен режим выбора и мы в админке
        tabBarStyle: selectionMode && isAdminRoute
          ? { display: 'none' }
          : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        
        options={{
          
          title: 'Мероприятия',
          headerShown: false,
          
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          title: 'Создать',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Модерация',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
