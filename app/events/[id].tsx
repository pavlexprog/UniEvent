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
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);

useEffect(() => {
  if (!id || Array.isArray(id)) return;

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
      if (res.data.joined) setAlreadyJoined(true);

      // Загружаем другие мероприятия организатора
      if (res.data.creator?.id) {
        const other = await api.get(`/events?creator_id=${res.data.creator.id}&limit=3`);
        setOtherEvents(other.data.filter((e: Event) => e.id !== Number(id)));
      }

    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось загрузить мероприятие');
    } finally {
      setLoading(false);
    }
  };

  fetchEvent();
}, [id]);
 


  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        console.log('Event data:', res.data);
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

       
          <View style={{ marginTop: 4, borderTopWidth: 1, borderColor: '#eee', paddingTop: 16 }}>
  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Описание</Text>
  <Text style={{ fontSize: 16, lineHeight: 22, color: '#444' }}>
    {event.description}
  </Text>
</View>
        </View>

        {event.creator && (
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Организатор</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={{ uri: event.creator.avatar_url ? `${BASE_URL}${event.creator.avatar_url}` : 'https://via.placeholder.com/100' }}
        style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500' }}>
          {event.creator.first_name} {event.creator.last_name}
        </Text>
        <Text style={{ color: '#666' }}>Мероприятий: {event.creator.total_events ?? 0}</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Добавлено', 'Вы добавили в друзья')}
          style={{
            marginTop: 6,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 14 }}>Добавить в друзья</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}

{otherEvents.length > 0 && (
  <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Другие мероприятия</Text>
    {otherEvents.map((e) => (
      <TouchableOpacity
        key={e.id}
        onPress={() => router.push(`/events/${e.id}`)}
        style={{
          flexDirection: 'row',
          marginBottom: 12,
          backgroundColor: '#f8f8f8',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: e.image_url ? `${BASE_URL}${e.image_url}` : 'https://via.placeholder.com/150' }}
          style={{ width: 100, height: 80 }}
        />
        <View style={{ flex: 1, padding: 8 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>{e.title}</Text>
          <Text style={{ color: '#666' }}>
            {new Date(e.event_date).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long',
              hour: '2-digit', minute: '2-digit'
            })}
          </Text>
          <Text style={{ fontSize: 12, color: '#999' }}>{e.location}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
)}
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
