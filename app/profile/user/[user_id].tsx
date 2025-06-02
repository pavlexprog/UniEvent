import { useEffect, useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BASE_URL } from '@/lib/config';

type UserSummary = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  total_events: number;
  attended_event_ids: number[];
  mutual_friends_count?: number;
};

export default function OtherUserProfileScreen() {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user_id) return;
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${user_id}/summary`);
        setUser(res.data);
      } catch (err) {
        console.error('Ошибка при получении профиля', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user_id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text>Пользователь не найден</Text>
      </View>
    );
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  const roleLabel = user.is_admin ? 'Администратор' : 'Пользователь';

  const menuItems = [
    {
      label: 'Организованные мероприятия',
      icon: <Ionicons name="calendar-outline" size={22} color="#1e88e5" />,
      onPress: () => router.push(`/events/by-user/${user.id}`),
    },
    {
      label: 'Посещённые мероприятия',
      icon: <Ionicons name="time-outline" size={22} color="#1e88e5" />,
      onPress: () => router.push(`/events/attended-by/${user.id}`), // сделаешь такой маршрут при необходимости
    },
    {
      label: 'Друзья',
      icon: <FontAwesome5 name="user-friends" size={20} color="#1e88e5" />,
      onPress: () => router.push(`/profile/user/${user.id}/friends`),
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#fff', flexGrow: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        {user.avatar_url ? (
          <Image
            source={{ uri: `${BASE_URL}${user.avatar_url}` }}
            style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16 }}
          />
        ) : (
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#ddd',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            <Text style={{ fontSize: 26, color: '#555' }}>
              {user.first_name?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
            </Text>
          </View>
        )}

        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{fullName}</Text>
          <Text style={{ color: '#777', marginTop: 2 }}>{roleLabel}</Text>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text>Организовал мероприятий: {user.total_events}</Text>
        <Text>Посетил: {user.attended_event_ids.length}</Text>
        {user.mutual_friends_count !== undefined && (
          <Text>Общие друзья: {user.mutual_friends_count}</Text>
        )}
      </View>

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          }}
          onPress={item.onPress}
        >
          <View style={{ width: 32, alignItems: 'center' }}>{item.icon}</View>
          <Text style={{ fontSize: 16, marginLeft: 12 }}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
