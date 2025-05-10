import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { api } from '../../lib/api';
import { Event } from '../../types';
import { BASE_URL } from '../../lib/config';
import { MotiView } from 'moti';

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
      } catch (error) {
        console.error('Ошибка при получении мероприятия', error);
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
        <Text variant="titleMedium">Мероприятие не найдено</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <IconButton icon="arrow-left" onPress={() => router.back()} />

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
          {event.image_url && (
            <Card.Cover source={{ uri: `${BASE_URL}${event.image_url}` }} />
          )}

          <Card.Title title={event.title} subtitle={`Категория: ${event.category}`} />

          <Card.Content style={{ gap: 8, marginBottom: 12 }}>
            <Text style={{ fontSize: 16 }}>{event.description}</Text>
            <Text>📍 {event.location || 'Место не указано'}</Text>
            <Text>🗓 {new Date(event.event_date).toLocaleString()}</Text>
            <Text>👥 Участников: {event.participants || 0}</Text>
          </Card.Content>

          <Card.Actions>
            <Button
              mode={alreadyJoined ? 'outlined' : 'contained'}
              onPress={handleAttend}
              disabled={alreadyJoined || attending}
              loading={attending}
            >
              {alreadyJoined ? 'Вы уже записались' : 'Я пойду'}
            </Button>
          </Card.Actions>
        </Card>
      </MotiView>
    </ScrollView>
  );
}
