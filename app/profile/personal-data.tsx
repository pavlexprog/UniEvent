import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ProfileHeader from '@/components/ProfileHeader';
import { useAuthContext } from '@/contexts/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import { api } from '@/lib/api';

export default function PersonalDataScreen() {
  
  const router = useRouter();
  const { user, refreshUser } = useAuthContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldKey, setFieldKey] = useState<'first_name' | 'last_name' | 'username'>('first_name');
  const [fieldLabel, setFieldLabel] = useState('Имя');
  const [fieldValue, setFieldValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState(false);
  

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
const [oldPassword, setOldPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [repeatPassword, setRepeatPassword] = useState('');
const [passwordError, setPasswordError] = useState('');
const [changingPassword, setChangingPassword] = useState(false);
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };  
  const isEmailValid = fieldKey !== 'username' || validateEmail(fieldValue);
const openEditModal = (
    key: 'first_name' | 'last_name' | 'username',
    label: string,
    value: string
  ) => {
    setFieldKey(key);
    setFieldLabel(label);
    setFieldValue(value);
    setEmailError(false); // сбрасываем ошибку при открытии
    setModalVisible(true);
  };

  // СОХРАНЕНИЕ ПАРОЛЯ:
const handleChangePassword = async () => {
  if (!oldPassword || !newPassword || !repeatPassword) {
    setPasswordError('Заполните все поля');
    return;
  }

  if (newPassword !== repeatPassword) {
    setPasswordError('Пароли не совпадают');
    return;
  }

  try {
    setChangingPassword(true);
    setPasswordError('');

    await api.post('/users/users/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });

    setPasswordModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setRepeatPassword('');
  } catch (err: any) {
    console.error('Ошибка смены пароля:', err);
    setPasswordError('Неверный старый пароль или ошибка сервера');
  } finally {
    setChangingPassword(false);
  }
};

  const updateUserProfile = async (
    data: Partial<{ first_name: string; last_name: string; username: string }>
  ) => {
    try {
      const response = await api.put('/users/users/me', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      throw error;
    }
  };



  const handleSave = async () => {
    if (!fieldValue.trim()) return;

    // если редактируем email — валидируем
    if (fieldKey === 'username' && !validateEmail(fieldValue)) {
      setEmailError(true);
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile({ [fieldKey]: fieldValue });
      await refreshUser();
      setModalVisible(false);
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
    } finally {
      setSaving(false);
    }
  };

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
    <>
      <ScrollView>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 50 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Персональные данные</Text>
          </View>

          <ProfileHeader
            avatarUrl={user.avatar_url ?? null}
            firstName={user.first_name}
            lastName={user.last_name}
            role={user.is_admin ? 'moderator' : 'user'}
            onAvatarUpdate={async () => {
              await refreshUser();
            }}
          />

          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 24 }}>
            Данные профиля
          </Text>

          <ProfileItem
            label="Имя"
            value={user.first_name}
            onPress={() => openEditModal('first_name', 'имя', user.first_name)}
          />
          <ProfileItem
            label="Фамилия"
            value={user.last_name}
            onPress={() => openEditModal('last_name', 'фамилию', user.last_name)}
          />
          <ProfileItem
            label="E-mail"
            value={user.username}
            onPress={() => openEditModal('username', 'E-mail', user.username)}
          />
         <ProfileItem
  label="Пароль"
  value="Изменить"
  onPress={() => setPasswordModalVisible(true)}
/>
</View>
      </ScrollView>

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)} backdropTransitionOutTiming={0}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
            Изменить {fieldLabel}
          </Text>

          <TextInput
            value={fieldValue}
            onChangeText={(text) => {
              setFieldValue(text);
              if (fieldKey === 'username') {
                setEmailError(!validateEmail(text));
              }
            }}
            placeholder={`Введите ${fieldLabel.toLowerCase()}`}
            placeholderTextColor="#aaa"
            style={{
              borderWidth: 1,
              borderColor: emailError ? 'red' : '#ddd',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 16,
              marginBottom: 8,
              backgroundColor: '#fafafa',
            }}
            keyboardType={fieldKey === 'username' ? 'email-address' : 'default'}
            autoCapitalize="none"
          />

          {emailError && fieldKey === 'username' && (
            <Text style={{ color: 'red', fontSize: 14, marginBottom: 16 }}>
              Введите корректный email
            </Text>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                flex: 1,
                backgroundColor: '#eee',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 16, color: '#555' }}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                backgroundColor: !isEmailValid || saving ? '#aaa' : '#007AFF',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
                marginLeft: 8,
              }}
                disabled={!isEmailValid || saving}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {saving ? 'Сохраняю...' : 'Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
  isVisible={passwordModalVisible}
  onBackdropPress={() => setPasswordModalVisible(false)}
  backdropTransitionOutTiming={0}
>
  <View
    style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    }}
  >
    <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
      Смена пароля
    </Text>

    <TextInput
      placeholder="Старый пароль"
      value={oldPassword}
      onChangeText={setOldPassword}
      secureTextEntry
      placeholderTextColor="#aaa"
      style={{
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#fafafa',
      }}
    />

    <TextInput
      placeholder="Новый пароль"
      value={newPassword}
      onChangeText={setNewPassword}
      secureTextEntry
      placeholderTextColor="#aaa"
      style={{
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#fafafa',
      }}
    />

    <TextInput
      placeholder="Повторите новый пароль"
      value={repeatPassword}
      onChangeText={setRepeatPassword}
      secureTextEntry
      placeholderTextColor="#aaa"
      style={{
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#fafafa',
      }}
    />

    {passwordError ? (
      <Text style={{ color: 'red', fontSize: 14, marginBottom: 12 }}>{passwordError}</Text>
    ) : null}

    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <TouchableOpacity
        onPress={() => setPasswordModalVisible(false)}
        style={{
          flex: 1,
          backgroundColor: '#eee',
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: 'center',
          marginRight: 8,
        }}
      >
        <Text style={{ fontSize: 16, color: '#555' }}>Отмена</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleChangePassword}
        disabled={changingPassword}
        style={{
          flex: 1,
          backgroundColor: changingPassword ? '#aaa' : '#007AFF',
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: 'center',
          marginLeft: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {changingPassword ? 'Сохраняю...' : 'Сохранить'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </>
  );
}
