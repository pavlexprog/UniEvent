// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Мероприятия',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" color={color} size={size} />
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
    </Tabs>
  );
}
