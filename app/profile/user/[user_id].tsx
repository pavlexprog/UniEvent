import { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Text, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { BASE_URL } from '@/lib/config';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Event, FriendshipStatus } from '@/types';
import { EventCard } from '@/components/EventCard';

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
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [activeTab, setActiveTab] = useState<'organized' | 'joined'>('organized');
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);

  const router = useRouter();
  const { user: currentUser } = useAuthContext();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

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

    const fetchFriendship = async () => {
      try {
        const res = await api.get(`/friends/status/${user_id}`);
        setFriendshipStatus(res.data.status);
      } catch (err) {
        console.error('Ошибка при получении статуса дружбы', err);
      }
    };

    const fetchOrganizedEvents = async () => {
      try {
        const res = await api.get(`/events/by-user/${user_id}`);
        setOrganizedEvents(res.data);
      } catch (err) {
        console.error('Ошибка загрузки организованных мероприятий', err);
      }
    };

    const fetchJoinedEvents = async () => {
      try {
        const res = await api.get(`/events/joined-by/${user_id}`);
        setJoinedEvents(res.data);
      } catch (err) {
        console.error('Ошибка загрузки посещённых мероприятий', err);
      }
    };

    fetchUser();
    fetchFriendship();
    fetchOrganizedEvents();
    fetchJoinedEvents();
  }, [user_id]);

  const handleFriendAction = async () => {
    try {
      if (friendshipStatus === 'none') {
        await api.post(`/friends/request/${user?.id}`);
        setFriendshipStatus('outgoing');
      } else if (friendshipStatus === 'outgoing') {
        await api.post(`/friends/cancel/${user?.id}`);
        setFriendshipStatus('none');
      } else if (friendshipStatus === 'incoming') {
        await api.post(`/friends/accept/${user?.id}`);
        setFriendshipStatus('friends');
      } else if (friendshipStatus === 'friends') {
        Alert.alert(
          'Удалить из друзей',
          'Вы уверены, что хотите удалить этого пользователя из друзей?',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Удалить', style: 'destructive', onPress: async () => {
              await api.post(`/friends/remove/${user?.id}`);
              setFriendshipStatus('none');
            } },
          ]
        );
      }
    } catch (err) {
      console.error('Ошибка при изменении статуса дружбы', err);
    }
  };

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username;
  const roleLabel = user?.is_admin ? 'Администратор' : 'Пользователь';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Пользователь не найден</Text>
      </View>
    );
  }

  const getFriendButtonLabel = () => {
    switch (friendshipStatus) {
      case 'none': return 'Добавить в друзья';
      case 'outgoing': return 'Отменить заявку';
      case 'incoming': return 'Принять заявку';
      case 'friends': return 'Удалить из друзей';
      default: return '';
    }
  };

  const getFriendButtonColor = () => {
    switch (friendshipStatus) {
      case 'friends': return '#e53935';
      case 'incoming': return '#2e7d32';
      case 'outgoing': return '#888';
      case 'none': return '#2e7d32';
      default: return '#888';
    }
  };

  const renderHeader = () => (
    <View>
      {/* Шапка */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>
          Профиль пользователя
        </Text>
      </View>

      <View style={styles.card}>
        {user.avatar_url ? (
          <Image source={{ uri: `${BASE_URL}${user.avatar_url}` }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={{ fontSize: 26, color: '#555' }}>
              {user.first_name?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.role}>{roleLabel}</Text>
          {user.mutual_friends_count !== undefined && (
            <Text style={{ marginTop: 8 }}>Общие друзья: {user.mutual_friends_count}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.friendButton, { backgroundColor: getFriendButtonColor() }]}
        onPress={handleFriendAction}
        activeOpacity={0.8}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{getFriendButtonLabel()}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push(`/profile/user/${user.id}/friends`)}
      >
        <View style={{ width: 32, alignItems: 'center' }}>
          <FontAwesome5 name="user-friends" size={20} color="#1e88e5" />
        </View>
        <Text style={{ fontSize: 16, marginLeft: 12 }}>Друзья</Text>
      </TouchableOpacity>

      {/* Табы */}
  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
  <TouchableOpacity onPress={() => setActiveTab('organized')}>
    <View style={{ alignItems: 'center', borderBottomWidth: activeTab === 'organized' ? 2 : 0, borderBottomColor: '#00b894' }}>
      <Text style={{ fontWeight: activeTab === 'organized' ? 'bold' : 'normal', color: activeTab === 'organized' ? '#000' : '#888', paddingVertical: 8, paddingHorizontal: 16 }}>
        Организует
      </Text>
      <Text>{organizedEvents.length}</Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setActiveTab('joined')}>
    <View style={{ alignItems: 'center', borderBottomWidth: activeTab === 'joined' ? 2 : 0, borderBottomColor: '#00b894' }}>
      <Text style={{ fontWeight: activeTab === 'joined' ? 'bold' : 'normal', color: activeTab === 'joined' ? '#000' : '#888', paddingVertical: 8, paddingHorizontal: 16 }}>
        Участвует
      </Text>
      <Text>{joinedEvents.length}</Text>
    </View>
  </TouchableOpacity>
</View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <FlatList
        data={activeTab === 'organized' ? organizedEvents : joinedEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPressDetails={() => router.push(`/events/${item.id}`)}
            isFavorite={isFavorite(item.id)}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 24 }}>
            Нет мероприятий
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 16 },
  defaultAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  role: { color: '#777', marginTop: 2 },
  friendButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1e88e5',
  },
  tabText: {
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
