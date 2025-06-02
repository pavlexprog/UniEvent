import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { User } from '@/types';
import { BASE_URL } from '@/lib/config';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FriendshipStatus } from '@/types'; 
import { useAuthContext } from '@/contexts/AuthContext';
//export type UserCardType = 'friends' | 'incoming' | 'outgoing';

type Props = {
  user: User;
  friendshipStatus?: FriendshipStatus; 
 
  onAccept?: () => void;
  onCancelRequest?: () => void;
  onRemoveFriend?: () => void;
  onSendRequest?: () => void;
  mutualFriendsCount?: number;
 onPress?: () => void;
    showMutualFriends?: boolean; // показывать ли общее число друзей
  showEventCount?: boolean;    // показывать ли число мероприятий
  disableNavigation?: boolean; // отключить переход по нажатию
  labelIfCurrentUser?: string; // текст, если это текущий пользователь
      // ID текущего пользователя

  isCurrentUser?: boolean;  
 
};

export default function UserCard({
  user,
  friendshipStatus,
  showMutualFriends,
  onAccept,
  onCancelRequest,
  onRemoveFriend,
  onSendRequest,
  mutualFriendsCount,
  disableNavigation = false,
  labelIfCurrentUser,
  isCurrentUser,
}: Props) {
 
  const avatarUri = user.avatar_url ? `${BASE_URL}${user.avatar_url}` : null;
  const { user: currentUser } = useAuthContext();

  const confirmAction = (title: string, action: () => void) => {
    Alert.alert(title, `Вы уверены, что хотите удалить из друзей пользователя ${user.first_name}?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Да', style: 'destructive', onPress: action },
    ]);
  };

  const handleButtonPress = () => {
    switch (friendshipStatus) {
      case 'friends':
        return confirmAction('Удалить из друзей', () => onRemoveFriend?.());
      case 'incoming':
        return onAccept?.();
      case 'outgoing':
        return confirmAction('Отменить заявку', () => onCancelRequest?.());
      case 'none':
        return onSendRequest?.();
    }
  };

  const renderButton = () => {
    if (isCurrentUser) {
      return (
        <View style={styles.thisIsYouContainer}>
          <Text style={styles.thisIsYouText}>{labelIfCurrentUser ?? 'Это вы'}</Text>
        </View>
      );
    }

    let label = '';
    let style = styles.buttonGray;

    switch (friendshipStatus) {
      case 'friends':
        label = 'Удалить из друзей';
        style = styles.buttonRed;
        break;
      case 'incoming':
        label = 'Принять заявку';
        style = styles.buttonGreen;
        break;
      case 'outgoing':
        label = 'Отменить заявку';
        style = styles.buttonGray;
        break;
      case 'none':
        label = 'Добавить в друзья';
        style = styles.buttonGreen;
        break;
    }

    return (
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handleButtonPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (!disableNavigation) {
    if (isCurrentUser) {
      router.push('/profile/profile'); // или как у тебя устроен маршрут для себя
    } else {
      router.push(`/profile/user/${user.id}`);
    }
  }
      }}
      style={styles.card}
      activeOpacity={0.9}
    >
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      ) : (
        <View style={styles.defaultAvatar}>
          <MaterialIcons name="person" size={32} color="#aaa" />
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
      {!isCurrentUser && showMutualFriends && typeof mutualFriendsCount === 'number' && mutualFriendsCount > 0 && (
  <Text style={{ color: '#666' }}>
    Общих друзей: {mutualFriendsCount}
  </Text>
)}

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
    alignItems: 'center'
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
  thisIsYouContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#dfe6e9',
    alignSelf: 'flex-start',
  },
  thisIsYouText: {
    color: '#636e72',
    fontWeight: '500',
  },
});
