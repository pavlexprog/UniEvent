import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';

import { BASE_URL } from '@/lib/config';
import { useAuthContext } from '@/contexts/AuthContext';
import { User } from '@/types';

type Props = {
  creator: User;
  isFriend: boolean;
  onAddFriend: () => void;
  onRemoveFriend: () => void;
};

export default function EventOrganizerCard({
  creator,
  isFriend,
  onAddFriend,
  onRemoveFriend
}: Props) {
  const { user } = useAuthContext();
  const isCurrentUser = user?.id === creator.id;

  const [eventCount, setEventCount] = useState<number | null>(creator.total_events ?? null);

//   useEffect(() => {
//     if (eventCount === null) {
//       axios
//         .get(`${BASE_URL}/count/by-user/${creator.id}`)
//         .then((res) => {
//           setEventCount(res.data.total_events);
//         })
//         .catch((err) => {
//           console.error('Ошибка при получении количества мероприятий:', err);
//         });
//     }
//   }, [creator.id]);

  const confirmRemoveFriend = () => {
    Alert.alert(
      'Удаление из друзей',
      `Вы уверены, что хотите удалить ${creator.first_name} из друзей?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: onRemoveFriend }
      ]
    );
  };

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Организатор</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{
            uri: creator.avatar_url
              ? `${BASE_URL}${creator.avatar_url}`
              : 'https://via.placeholder.com/100',
          }}
          style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            {creator.first_name} {creator.last_name}
          </Text>
          <Text style={{ color: '#666' }}>
            Мероприятий: {eventCount ?? 0}
          </Text>

          {isCurrentUser ? (
            <Text style={{ marginTop: 6, color: '#888' }}>(Это вы)</Text>
          ) : isFriend ? (
            <TouchableOpacity
              onPress={confirmRemoveFriend}
              style={{
                marginTop: 6,
                backgroundColor: '#e53935',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                Удалить из друзей
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onAddFriend}
              style={{
                marginTop: 6,
                backgroundColor: '#2e7d32',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                Добавить в друзья
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
