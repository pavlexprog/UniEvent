import { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import { useAuthContext } from '../../contexts/AuthContext'; 
import { Protected } from '../../components/Protected';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
const { isAuthenticated, loading, logout } = useAuthContext();
  const router = useRouter();


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  // Если пользователь не авторизован — уводим на логин
  if (!loading && !isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Разрешение необходимо', 'Разрешите доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !date || !category) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
  
    let imageUrl = null;
  
    try {
      // 1. Загрузка изображения
      if (image) {
        const formData = new FormData();
        const filename = image.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const ext = match?.[1] ?? 'jpg';
        const type = `image/${ext}`;
  
        formData.append('file', {
          uri: image,
          name: filename,
          type,
        } as any);
  
        const imageUploadResponse = await api.post('/upload/upload/event_image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        imageUrl = imageUploadResponse.data.url;
      }
  
      // 2. Отправка данных события
      const payload = {
        title,
        description,
        category,
        event_date: date.toISOString(),
        image_url: imageUrl, // этот ключ должен быть в вашей модели EventCreate, если вы его добавите
      };
  
      await api.post('/events/', payload);
  
      Alert.alert('Успех', 'Мероприятие отправлено на модерацию');
      router.push('/(tabs)');
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось создать мероприятие');
 
    }
  };
  

  return (
    // <Protected>
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 12 }}>
          Создать мероприятие
        </Text>

        <TextInput
          label="Название"
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ marginBottom: 12 }}
        />
        <Text style={{ marginBottom: 4 }}>Категория</Text>
<View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 12 }}>
  <Picker
    selectedValue={category}
    onValueChange={(itemValue) => setCategory(itemValue)}
  >
    <Picker.Item label="Выберите категорию..." value="" />
    <Picker.Item label="Концерт" value="Концерт" />
    <Picker.Item label="Спорт" value="Спорт" />
    <Picker.Item label="Кино" value="Кино" />
    <Picker.Item label="Другое" value="Другое" />
  </Picker>
</View>
        <TouchableOpacity onPress={handlePickImage}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: '100%', height: 200, marginBottom: 12, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <Button mode="outlined" style={{ marginBottom: 12 }}>
              Загрузить изображение
            </Button>
          )}
        </TouchableOpacity>

        <Button onPress={() => setShowPicker(true)} style={{ marginBottom: 12 }}>
          Выбрать дату и время
        </Button>
        <Text style={{ marginBottom: 12 }}>
          Выбрано: {date.toLocaleString()}
        </Text>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Button mode="contained" onPress={handleSubmit}>
          Создать
        </Button>
      </Card>
    </ScrollView>
    // </Protected>
  );
}
