import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Event } from '../../types';
import { BASE_URL } from '../../lib/config';
import { MaterialIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

type EventWithJoined = Event & { joined?: boolean };

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [event, setEvent] = useState<EventWithJoined | null>(null);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
        if (res.data.joined) setAlreadyJoined(true);
      } catch (err) {
        console.error(err);
        Alert.alert('Ошибка', 'Не удалось загрузить мероприятие');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleAttend = async () => {
    try {
      setAttending(true);
      await api.post(`/events/${id}/attend`);
      Alert.alert('Успешно', 'Вы записались на мероприятие');
      setAlreadyJoined(true);
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось записаться');
    } finally {
      setAttending(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Приглашаю на мероприятие "${event.title}" — ${event.description}`,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18 }}>Мероприятие не найдено</Text>
      </View>
    );
  }

  const eventImage = event.image_url ? `${BASE_URL}${event.image_url}` : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Верхняя панель */}
      <View
        style={{
          height: 56,
          backgroundColor: '#fff',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderColor: '#eee',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ fontSize: 18, fontWeight: '500', flex: 1, textAlign: 'center', marginHorizontal: 12 }}
        >
          {event.title}
        </Text>
        <TouchableOpacity onPress={handleShare}>
          <MaterialIcons name="share" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Картинка мероприятия */}
        <View>
          {eventImage ? (
            <Image
              source={{ uri: eventImage }}
              style={{ width: screenWidth, height: 240 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: screenWidth,
                height: 240,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
              }}
            >
              <MaterialIcons name="event" size={72} color="#bbb" />
            </View>
          )}

          {/* Звезда */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 200,
              right: 16,
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 6,
              elevation: 3,
            }}
            onPress={() => {}}
          >
            <MaterialIcons name="star-border" size={24} color="gold" />
          </TouchableOpacity>
        </View>

        {/* Информация о мероприятии */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{event.title}</Text>

          <Text style={{ fontSize: 16, color: '#666', marginBottom: 4 }}>
            🗓 {new Date(event.event_date).toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          <Text style={{ fontSize: 16, marginBottom: 4 }}>{event.category}</Text>

          <Text style={{ fontSize: 16, marginBottom: 12 }}>
            👥 Участников: {event.participants ?? 0}
          </Text>

          <Text style={{ fontSize: 16, lineHeight: 22, color: '#444' }}>{event.description}</Text>
        </View>
      </ScrollView>

      {/* Нижняя кнопка */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        {!alreadyJoined ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#2e7d32',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
            onPress={handleAttend}
            disabled={attending}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {attending ? 'Запись...' : 'Я пойду'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              paddingVertical: 14,
              alignItems: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#666' }}>Вы уже записались</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
