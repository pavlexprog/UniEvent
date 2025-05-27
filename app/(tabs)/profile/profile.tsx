import { View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuthContext } from '../../../contexts/AuthContext';
import { BASE_URL } from '@/lib/config';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthContext();
  const router = useRouter();
  const { avatarUri } = useAuthContext();
  
  if (!isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>
          Вы не вошли в аккаунт.{' '}
          <Text
            style={{ color: '#1e88e5' }}
            onPress={() => router.push('/auth/login')}
          >
            Войдите
          </Text>{' '}
          или{' '}
          <Text
            style={{ color: '#1e88e5' }}
            onPress={() => router.push('/auth/register')}
          >
            зарегистрируйтесь
          </Text>, чтобы использовать все возможности приложения.
        </Text>
      </View>
    );
  }

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  const roleLabel = user.is_admin ? 'Администратор' : 'Пользователь';

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            logout();
            //router.replace('/events/index'); // 👈 Переход после выхода
            router.replace('/auth/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      label: 'Создать мероприятие',
      icon: <MaterialIcons name="add-circle-outline" size={24} color="#1e88e5" />,
      onPress: () => router.push('/(tabs)/create-event'),
    },
     ...(user?.is_admin
    ? [
        {
          label: 'Модерация мероприятий',
          icon: (
            <Ionicons name="alert-circle-outline" size={24} color="#cc0000" />
          ),
          onPress: () => router.push('/admin'),
        },
      ]
    : []),
    {
      label: 'Мои мероприятия',
      icon: <Ionicons name="calendar-outline" size={24} color="#1e88e5" />,
      onPress: () => router.push('/events/MyEventsScreen'),
    },
    {
      label: 'Предстоящие мероприятия',
      icon: <Ionicons name="time-outline" size={24} color="#1e88e5" />,
      onPress: () => router.push('/events/upcoming'),
    },
    {
      label: 'Избранное',
      icon: <Ionicons name="star-outline" size={24} color="#1e88e5" />,
      onPress: () => router.push('/events/favorites'),
    },
    // {
    //   label: 'Уведомления',
    //   icon: <Ionicons name="notifications-outline" size={24} color="#1e88e5" />,
    // },
    {
      label: 'Друзья',
      icon: <FontAwesome5 name="user-friends" size={20} color="#1e88e5" />,
       onPress: () => router.push('/profile/FriendsScreen'),
    },
    {
      label: 'Выйти из аккаунта',
      icon: <MaterialIcons name="logout" size={24} color="#cc0000" />,
      onPress: handleLogout,
      isLogout: true,
    },
  ];
  

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#fff', flexGrow: 1 }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
          justifyContent: 'space-between',
        }}
        onPress={() => router.push('/profile/personal-data')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {user.avatar_url ? (
            <Image
              source={{ uri: `${BASE_URL}${avatarUri}` }}
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
        <MaterialIcons name="keyboard-arrow-right" size={24} color="#888" />
      </TouchableOpacity>

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
