// components/UserCard.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { User } from '@/types';
import { BASE_URL } from '@/lib/config';

export type UserCardType = 'friends' | 'incoming' | 'outgoing';

type Props = {
  user: User;
  type: UserCardType;
  onAccept?: () => void;
  onCancelRequest?: () => void;
  onRemoveFriend?: () => void;
};

export default function UserCard({ user, type, onAccept, onCancelRequest, onRemoveFriend }: Props) {
  const [processing, setProcessing] = useState(false);

  const confirmAction = (title: string, action: () => void) => {
    Alert.alert(title, `Вы уверены, что хотите выполнить действие для ${user.first_name}?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Да', style: 'destructive', onPress: action },
    ]);
  };

  const renderButton = () => {
    switch (type) {
      case 'friends':
        return (
          <TouchableOpacity
            onPress={() => confirmAction('Удалить из друзей', () => onRemoveFriend?.())}
            disabled={processing}
           
          >
            <Text>Удалить</Text>
          </TouchableOpacity>
        );
      case 'incoming':
        return (
          <TouchableOpacity
            onPress={() => onAccept?.()}
            disabled={processing}
            
          >
            <Text>Принять</Text>
          </TouchableOpacity>
        );
      case 'outgoing':
        return (
          <TouchableOpacity
            onPress={() => confirmAction('Отменить заявку', () => onCancelRequest?.())}
            disabled={processing}
           
          >
            <Text>Отменить</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View>
      <Image
        source={{ uri: user.avatar_url ? `${BASE_URL}${user.avatar_url}` : 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text>{user.first_name} {user.last_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {renderButton()}
      </View>
    </View>
  );
}

const styles = {
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  buttonGreen: {
    backgroundColor: '#2e7d32',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonRed: {
    backgroundColor: '#e53935',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonGray: {
    backgroundColor: '#888',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
};
