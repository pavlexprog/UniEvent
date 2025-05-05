import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Card, Button } from 'react-native-paper';
import { api } from '../../lib/api';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.error('Ошибка при получении мероприятия', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleAttend = async () => {
    try {
      await api.post(`/events/${id}/attend`);
      Alert.alert('Успешно', 'Вы записались на мероприятие');
      router.replace(`/events/${id}`);
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось записаться на мероприятие');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;
  if (!event) return <Text>Мероприятие не найдено</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card>
        {event.image_url && <Card.Cover source={{ uri: event.image_url }} />}
        <Card.Title title={event.title} subtitle={`Категория: ${event.category}`} />
        <Card.Content>
          <Text style={{ marginBottom: 8 }}>{event.description}</Text>
          <Text>📍 {event.location || 'Место не указано'}</Text>
          <Text>🗓 {new Date(event.event_date).toLocaleString()}</Text>
          <Text>👥 Участников: {event.participants?.length || 0}</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleAttend}>Я пойду</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}
