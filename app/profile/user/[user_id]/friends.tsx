import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';

import UserCard from '@/components/UserCard';
import { UserWithFriendshipStatus } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';
// Тип вкладки
type Tab = 'friends' | 'mutual';

export default function OtherUserFriendsScreen() {
  const { user_id } = useLocalSearchParams<{ user_id: string }>();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<UserWithFriendshipStatus[]>([]);
  const [mutualFriends, setMutualFriends] = useState<UserWithFriendshipStatus[]>([]);
  const { user: currentUser } = useAuthContext();
const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/users/me');
      setCurrentUserId(res.data.id);
    } catch (err) {
      console.error('Ошибка при получении текущего пользователя:', err);
    }
  };

  fetchCurrentUser();
}, []);

  useEffect(() => {
    if (!user_id) return;
    fetchFriends();
  }, [user_id]);

  const fetchFriends = async () => {
    try {
      const [allRes, mutualRes] = await Promise.all([
        api.get(`/users/${user_id}/friends`),
        api.get(`/friends/mutual/${user_id}`),
      ]);
      setFriends(allRes.data);
      setMutualFriends(mutualRes.data);
    } catch (err) {
      console.error('Ошибка при загрузке друзей:', err);
    }
  };
    const handleSendRequest = async (id: number) => {
    try {
      await api.post(`/friends/${id}`);
      fetchFriends();
    } catch (err) {
      console.error('Ошибка при отправке заявки в друзья:', err);
    }
  };

  const handleRemoveFriend = async (id: number) => {
    try {
      await api.post(`/friends/${id}/remove`);
      fetchFriends();
    } catch (err) {
      console.error('Ошибка при удалении друга:', err);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await api.post(`/friends/${id}/accept`);
      fetchFriends();
    } catch (err) {
      console.error('Ошибка при принятии заявки:', err);
    }
  };

  const handleCancelRequest = async (id: number) => {
    try {
      await api.post(`/friends/${id}/cancel`);
      fetchFriends();
    } catch (err) {
      console.error('Ошибка при отмене заявки:', err);
    }
  };

  const getTabStyle = (t: Tab): TextStyle => ({
    fontWeight: tab === t ? 'bold' : 'normal',
    color: tab === t ? '#000' : '#888',
    paddingVertical: 8,
    paddingHorizontal: 16,
  });

  const renderList = () => {
    const list = tab === 'friends' ? friends : mutualFriends;
    return (
      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            friendshipStatus={item.friendship_status}
           
            onAccept={() => handleAccept(item.id)}
            onCancelRequest={() => handleCancelRequest(item.id)}
            onRemoveFriend={() => handleRemoveFriend(item.id)}
            onSendRequest={() => handleSendRequest(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 32 }}>
            Список пуст
          </Text>
        }
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f4', paddingTop: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>
          Друзья пользователя
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity onPress={() => setTab('friends')}>
          <View style={{ alignItems: 'center', borderBottomWidth: tab === 'friends' ? 2 : 0, borderBottomColor: '#00b894' }}>
            <Text style={getTabStyle('friends')}>Все друзья</Text>
            <Text>{friends.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('mutual')}>
          <View style={{ alignItems: 'center', borderBottomWidth: tab === 'mutual' ? 2 : 0, borderBottomColor: '#00b894' }}>
            <Text style={getTabStyle('mutual')}>Общие</Text>
            <Text>{mutualFriends.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {renderList()}
    </View>
  );
}
