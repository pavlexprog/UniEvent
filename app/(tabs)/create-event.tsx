import { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TextInput, Button, Text } from 'react-native-paper';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import PhotoUpload from '@/components/PhotoUpload';
import EventDateTimePicker from '@/components/EventDateTimePicker';
import AutoResizeTextInput from '@/components/AutoResizeTextInput';
import { useAuthContext } from '@/contexts/AuthContext';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');

  const [date, setDate] = useState(new Date());
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = Dimensions.get('window');
  const router = useRouter();
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [category, setCategory] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [description, setDescription] = useState('');
  const { user, isAuthenticated, logout } = useAuthContext();

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = await SecureStore.getItemAsync('token');
      if (!savedToken) {
        router.replace('/');
      } else {
        setToken(savedToken);
      }
      setLoading(false);
    };

    checkToken();
  }, []);



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



  

  

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) return null;

  // const handlePickImage = async () => {
  //   const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (!permission.granted) {
  //     Alert.alert('Разрешение необходимо', 'Разрешите доступ к галерее');
  //     return;
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     quality: 1,
  //   });

  //   if (!result.canceled && result.assets.length > 0) {
  //     const newImages = result.assets.map((asset) => asset.uri);
  //     setImages((prev) => [...prev, ...newImages].slice(0, 9));
  //   }
  // };

  // const openGalleryModal = (index: number) => {
  //   setActiveIndex(index);
  //   setShowModal(true);
  // };

  // const renderImage = ({ item, index }: { item: string; index: number }) => (
  //   <TouchableOpacity onPress={() => openGalleryModal(index)}>
  //     <Image
  //       source={{ uri: item }}
  //       style={{ width: 100, height: 100, borderRadius: 8, marginRight: 8 }}
  //     />
  //   </TouchableOpacity>
  // );


  const handleSubmit = async () => {
    if (!title || !description || !date || !category) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    

    try {
      let imageUrls: string[] = [];
  
      // Загружаем каждое изображение по очереди
      for (const uri of images) {
        const formData = new FormData();
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const ext = match?.[1] ?? 'jpg';
        const type = `image/${ext}`;
  
        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any);
  
        const uploadRes = await api.post('/upload/upload/event_image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
  
        imageUrls.push(uploadRes.data.url);
      }

      const payload = {
        title,
        description,
        category,
        event_date: date.toISOString(),
        image_url: imageUrls,
      };

      await api.post('/events/', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Успех', 'Мероприятие отправлено на модерацию');
      setTitle('');
      setDescription('');
      setCategory('');
      setEventDate(null);
      setImages([]);
  
      //router.push('/(tabs)');
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось создать мероприятие');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 100,
          }}
          keyboardShouldPersistTaps="handled"
        >
      <PhotoUpload images={images} setImages={setImages} />
      <EventDateTimePicker date={eventDate} setDate={setEventDate} />
    {/* Название мероприятия */}
<View style={{ marginBottom: 20 }}>
  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: "black" }}>Название мероприятия</Text>
  <TextInput
    value={title}
    onChangeText={setTitle}
    placeholder="Например, Концерт"
    placeholderTextColor="#999999"
    onFocus={() => {
      scrollRef.current?.scrollTo({ y: 250, animated: true }); // прокрутка к полю
    }}
    maxLength={50}
    style={{
      backgroundColor: '#f5f5f5',
      padding: 14,
      borderRadius: 12,
      fontSize: 14,
      height: 30,
    }}
  />
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
    <Text style={{ fontSize: 12, color: '#999' }}>Обязательное поле</Text>
    <Text style={{ fontSize: 12, color: '#999' }}>{title.length}/50</Text>
  </View>
</View>

{/* Категория */}
<View style={{ marginBottom: 20 }}>
  <TouchableOpacity
    onPress={() => setCategoryModalVisible(true)}
    style={{
      backgroundColor: '#f5f5f5',
      padding: 14,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="pricetag-outline" size={18} color="green" style={{ marginRight: 8 }} />
      <Text style={{ fontSize: 16, fontWeight: '600', color: "black"}}>Категория</Text>
    </View>
    <Text style={{ fontSize: 14, color: category ? '#000' : '#888' }}>
      {category || 'Выберите категорию'}
    </Text>
  </TouchableOpacity>
</View>


  <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: 'black' }}>
        Описание
      </Text>

      <TextInput
  value={description}
  onChangeText={setDescription}
  multiline
  mode="flat" // или "outlined", как тебе нравится
  placeholder="Описание мероприятия"
  placeholderTextColor="#999999"
  cursorColor="black"
  style={{
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    fontSize: 14,
    height: 100,
  }}
  contentStyle={{
    textAlignVertical: 'top', // теперь работает!
    padding: 14,
    color: 'black',
  }}
  maxLength={4000}
/>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 12, color: '#999' }}>Обязательное поле</Text>
        <Text style={{ fontSize: 12, color: '#999' }}>{description.length}/4000</Text>
      </View>
    </View>
  
<TouchableOpacity
  onPress={handleSubmit}
  disabled={!title || !description || !category || !eventDate}
  style={{
    backgroundColor:
      !title || !description || !category ||  !eventDate
        ? '#ccc'
        : '#b23cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }}
>
  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Отправить</Text>

  <Modal
  visible={categoryModalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setCategoryModalVisible(false)}
>
  <TouchableWithoutFeedback onPress={() => setCategoryModalVisible(false)}>
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: 'white',
          padding: 24,
          borderRadius: 16,
          width: '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Выберите категорию</Text>

        {['Концерт', 'Спорт', 'Кино', 'Другое'].map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => {
              setCategory(category);
              setCategoryModalVisible(false);
            }}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: category === category ? '#3c82f6' : '#f5f5f5',
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, color: category === category ? 'white' : '#000' }}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => setCategoryModalVisible(false)}
          style={{ marginTop: 10, alignSelf: 'flex-end' }}
        >
          <Text style={{ color: '#3c82f6', fontWeight: '500' }}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableWithoutFeedback>
</Modal>

</TouchableOpacity>
      </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
}
