import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import UserCard from '@/components/UserCard';
import { UserWithFriendshipStatus } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

type Tab = 'all' | 'friends';

export default function EventParticipantsScreen() {
  const { id } = useLocalSearchParams<{id: string }>();
  const [tab, setTab] = useState<Tab>('all');
  const [allParticipants, setAllParticipants] = useState<UserWithFriendshipStatus[]>([]);
  const [friendParticipants, setFriendParticipants] = useState<UserWithFriendshipStatus[]>([]);
  const router = useRouter();
const { user: currentUser } = useAuthContext();
  useEffect(() => {
     console.log('event_id:', id);
    if (!id) return;
    fetchParticipants();
  }, [id]);

  const fetchParticipants = async () => {
    try {
      const [allRes, friendsRes] = await Promise.all([
        api.get(`/events/${id}/participants`),
        api.get(`/events/${id}/participants/friends`),
        
      ]);
      setAllParticipants(allRes.data);
      setFriendParticipants(friendsRes.data);

      console.log('All:', allRes.data);
console.log('Friends:', friendsRes.data);
    } catch (err) {
      console.error('Ошибка загрузки участников:', err);
    }
  };

  const getTabStyle = (t: Tab) => ({
    fontWeight: tab === t ? 'bold' : 'normal' as TextStyle['fontWeight'],
    color: tab === t ? '#000' : '#888',
    paddingVertical: 8,
    paddingHorizontal: 16,
  });
  const handleUserPress = (userId: number) => {
    if (userId === currentUser?.id) {
      //router.push('../../(tabs)/profile/profile'); // путь на свой профиль (пример)
    } else {
      router.push(`../../user/${userId}`); // путь на профиль другого пользователя
    }
  };

  const handleAccept = async (id: number) => {
  try {
    await api.post(`/friends/${id}/accept`);
    await fetchParticipants();
  } catch (err) {
    console.error('Ошибка при принятии заявки:', err);
  }
};

const handleCancel = async (id: number) => {
  try {
    await api.post(`/friends/${id}/cancel`);
    await fetchParticipants();
  } catch (err) {
    console.error('Ошибка при отмене заявки:', err);
  }
};

const handleRemove = async (id: number) => {
  try {
    await api.post(`/friends/${id}/remove`);
    await fetchParticipants();
  } catch (err) {
    console.error('Ошибка при удалении друга:', err);
  }
};

const handleSendRequest = async (id: number) => {
  try {
    await api.post(`/friends/${id}`);
    await fetchParticipants();
  } catch (err) {
    console.error('Ошибка при отправке заявки:', err);
  }
};
  const renderList = () => {
    const list = tab === 'all' ? allParticipants : friendParticipants;
    return (
      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            friendshipStatus={tab === 'friends' ? 'friends' : item.friendship_status}
            onAccept={() => api.post(`/friends/${item.id}/accept`).then(fetchParticipants)}
            onCancelRequest={() => api.post(`/friends/${item.id}/cancel`).then(fetchParticipants)}
            onRemoveFriend={() => api.post(`/friends/${item.id}/remove`).then(fetchParticipants)}
            onSendRequest={() => api.post(`/friends/${item.id}`).then(fetchParticipants)}
            onPress={() => handleUserPress(item.id)}
          />
          
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>Список пуст</Text>}
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
          Участники мероприятия
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity onPress={() => setTab('all')}>
          <View style={{ alignItems: 'center', borderBottomWidth: tab === 'all' ? 2 : 0, borderBottomColor: '#00b894' }}>
            <Text style={getTabStyle('all')}>Все</Text>
            <Text>{allParticipants.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('friends')}>
          <View style={{ alignItems: 'center', borderBottomWidth: tab === 'friends' ? 2 : 0, borderBottomColor: '#00b894' }}>
            <Text style={getTabStyle('friends')}>Друзья</Text>
            <Text>{friendParticipants.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {renderList()}
    </View>
  );
}
