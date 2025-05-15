import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProfileHeader from '@/components/ProfileHeader';
import { useAuthContext } from '@/contexts/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';

export default function PersonalDataScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthContext();
  const { avatarUri } = useAuthContext();

  const ProfileItem = ({ label, value, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
      }}
    >
      <Text style={{ fontSize: 16 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#777', marginRight: 6 }}>{value}</Text>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (!user) return null;

  return (
    <ScrollView>
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 50 }}>
      {/* Верхняя панель */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Персональные данные</Text>
      </View>

      {/* Шапка профиля с аватаром */}
      <ProfileHeader
   avatarUrl={avatarUri}
  firstName={user.first_name}
  lastName={user.last_name}
  role={user.is_admin ? 'moderator' : 'user'}
  onAvatarUpdate={async () => {
    await refreshUser(); // обновим данные из API
  }}
/>


      {/* Данные профиля */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 24 }}>
        Данные профиля
      </Text>

      <ProfileItem label="Имя" value={user.first_name} onPress={() => router.push('/')} />
      <ProfileItem label="Фамилия" value={user.last_name} onPress={() => router.push('/')} />
      <ProfileItem label="E-mail" value={user.username} onPress={() => router.push('/')} />
      <ProfileItem label="Пароль" value="Изменить" onPress={() => router.push('/')} />
    </View>
    </ScrollView>
  );
}
