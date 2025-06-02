import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { User, FriendshipStatus } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';
import { BASE_URL } from '@/lib/config';
import { router } from 'expo-router';
import axios from 'axios';

type Props = {
  creator: User;
  friendshipStatus?: FriendshipStatus;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onAccept?: () => void;
  onCancelRequest?: () => void;
};

export default function EventOrganizerCard({
  creator,
  friendshipStatus,
  onAddFriend,
  onRemoveFriend,
  onAccept,
  onCancelRequest,
}: Props) {
  const { user } = useAuthContext();
  const isCurrentUser = user?.id === creator.id;

  const [eventCount, setEventCount] = useState(creator.total_events ?? 0);
  const [mutualFriendsCount, setMutualFriendsCount] = useState(creator.mutual_friends_count ?? 0);

  useEffect(() => {
    if (creator.total_events === undefined || creator.mutual_friends_count === undefined) {
      axios.get(`${BASE_URL}/users/${creator.id}/summary`)
        .then(res => {
          setEventCount(res.data.total_events);
          setMutualFriendsCount(res.data.mutual_friends_count);
        })
        .catch(err => console.error('Ошибка при получении данных организатора:', err));
    }
  }, [creator.id]);

  const confirmAction = (title: string, action: () => void) => {
    Alert.alert(title, `Вы уверены, что хотите выполнить это действие?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Да', style: 'destructive', onPress: action },
    ]);
  };

  const renderButton = () => {
    if (isCurrentUser) return <Text style={{ marginTop: 6, color: '#888' }}>(Это вы)</Text>;

    let label = '';
    let style = styles.buttonGray;
    let action = () => {};

    switch (friendshipStatus) {
      case 'friends':
        label = 'Удалить из друзей';
        style = styles.buttonRed;
        action = () => confirmAction(label, () => onRemoveFriend?.());
        break;
      case 'incoming':
        label = 'Принять заявку';
        style = styles.buttonGreen;
        action = () => onAccept?.();
        break;
      case 'outgoing':
        label = 'Отменить заявку';
        style = styles.buttonGray;
        action = () => confirmAction(label, () => onCancelRequest?.());
        break;
      case 'none':
      default:
        label = 'Добавить в друзья';
        style = styles.buttonGreen;
        action = () => onAddFriend?.();
        break;
    }

    return (
      <TouchableOpacity onPress={action} style={[styles.button, style]}>
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const avatarUri = creator.avatar_url ? `${BASE_URL}${creator.avatar_url}` : null;

  return (
    <TouchableOpacity
      onPress={() => !isCurrentUser && router.push(`/profile/user/${creator.id}`)}
      disabled={isCurrentUser}
      style={styles.card}
    >
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      ) : (
        <View style={styles.defaultAvatar}>
          <MaterialIcons name="person" size={32} color="#aaa" />
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{creator.first_name} {creator.last_name}</Text>
        <Text style={styles.detailText}>Мероприятий: {eventCount}</Text>
        <Text style={styles.detailText}>Общих друзей: {mutualFriendsCount}</Text>
        {renderButton()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  button: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    alignSelf: 'flex-end',
    width: '100%',
  },
  buttonGreen: {
    backgroundColor: '#2e7d32',
  },
  buttonRed: {
    backgroundColor: '#e53935',
  },
  buttonGray: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
