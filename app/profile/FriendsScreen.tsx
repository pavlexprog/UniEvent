import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, TextStyle } from 'react-native';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { User } from '@/types';
import EventOrganizerCard from '@/components/EventOrganizerCard'; // переименовать позже, например, в UserCard

type Tab = 'friends' | 'incoming' | 'outgoing';

export default function FriendsScreen() {
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [incoming, setIncoming] = useState<User[]>([]);
  const [outgoing, setOutgoing] = useState<User[]>([]);
  const { user } = useAuthContext();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const [res1, res2, res3] = await Promise.all([
        api.get('/friends'),               // друзья
        api.get('/friends/incoming'),     // входящие заявки
        api.get('/friends/outgoing'),     // исходящие
      ]);
      setFriends(res1.data);
      setIncoming(res2.data);
      setOutgoing(res3.data);
    } catch (err) {
      console.error('Ошибка при загрузке друзей:', err);
    }
  };

  const getTabStyle = (t: Tab): TextStyle => ({
    fontWeight: tab === t ? 'bold' : 'normal',
    color: tab === t ? '#000' : '#888',
    paddingVertical: 8,
    paddingHorizontal: 16,
  });

  const renderList = () => {
    const list = tab === 'friends' ? friends : tab === 'incoming' ? incoming : outgoing;
    return (
      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <EventOrganizerCard
            creator={item}
            isFriend={tab === 'friends'}
            onAddFriend={() => {}}
            onRemoveFriend={() => {}}
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
      {/* Заголовок */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>
          Друзья
        </Text>
      </View>

      {/* Вкладки */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity onPress={() => setTab('friends')}>
          <View style={{ alignItems: 'center', borderBottomWidth: tab === 'friends' ? 2 : 0, borderBottomColor: '#00b894' }}>
            <Text style={getTabStyle('friends')}>Друзья</Text>
            <Text>{friends.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('incoming')}>
          <View style={{ alignItems: 'center', borderBottomWidth: tab === 'incoming' ? 2 : 0, borderBottomColor: '#00b894' }}>
            <Text style={getTabStyle('incoming')}>Входящие заявки</Text>
            <Text>{incoming.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('outgoing')}>
          <View style={{ alignItems: 'center', borderBottomWidth: tab === 'outgoing' ? 2 : 0, borderBottomColor: '#00b894' }}>
            <Text style={getTabStyle('outgoing')}>Исходящие заявки</Text>
            <Text>{outgoing.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Список */}
      {renderList()}
    </View>
  );
}
