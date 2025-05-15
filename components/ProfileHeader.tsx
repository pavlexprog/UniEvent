import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/lib/api'; // убедись, что путь правильный
import { BASE_URL } from '@/lib/config';

type Props = {
  avatarUrl: string | null;
  firstName: string;
  lastName: string;
  role: 'user' | 'moderator';
  onAvatarUpdate: (uri: string) => void;
};

const ProfileHeader: React.FC<Props> = ({ avatarUrl, firstName, lastName, role, onAvatarUpdate }) => {
    const handleAvatarUpload = async () => {
        try {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Разрешение нужно', 'Пожалуйста, разрешите доступ к галерее');
            return;
          }
      
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
          });
      
          if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            const fileName = uri.split('/').pop() || 'avatar.jpg';
            const extMatch = /\.(\w+)$/.exec(fileName);
            const fileType = extMatch ? `image/${extMatch[1]}` : 'image/jpeg';
      
            const formData = new FormData();
            formData.append('file', {
              uri,
              name: fileName,
              type: fileType,
            } as any);
      
            const response = await api.post('/upload/upload/avatar', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
      
            const uploadedUrl = response.data?.url;
      
            if (uploadedUrl) {
              onAvatarUpdate(uploadedUrl);
            } else {
              Alert.alert('Ошибка', 'Сервер не вернул ссылку на изображение');
            }
          }
        } catch (error) {
          console.error('Avatar upload error:', error);
          Alert.alert('Ошибка', 'Не удалось загрузить аватар');
        }
      };
      

  const displayRole = role === 'moderator' ? 'Администратор' : 'Пользователь';

  return (
    <View style={{ alignItems: 'center', marginTop: 24 }}>
      <TouchableOpacity onPress={handleAvatarUpload}>
        <View>
        {avatarUrl ? (
  <Image
    source={{ uri: `${BASE_URL}${avatarUrl}` }}
    style={{
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#eee',
    }}
  />
) : (
  <View
    style={{
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#eee',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <MaterialIcons name="person" size={48} color="#aaa" />
  </View>
)}

          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 4,
              elevation: 4,
            }}
          >
            <MaterialIcons name="edit" size={16} color="#1e88e5" />
          </View>
        </View>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 12 }}>
        {firstName} {lastName}
      </Text>
      <Text style={{ color: '#777', marginTop: 4 }}>{displayRole}</Text>
    </View>
  );
};

export default ProfileHeader;