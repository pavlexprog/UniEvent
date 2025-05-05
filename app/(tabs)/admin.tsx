// app/(admin)/admin-events.tsx
import { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Event} from '../../types/index'

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось загрузить мероприятия');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (id: number) => {
    Alert.alert('Удаление', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/events/${id}`);
            setEvents(prev => prev.filter(e => e.id !== id));
            Alert.alert('Успешно', 'Мероприятие удалено');
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить');
          }
        },
      },
    ]);
  };

  if (loading) return <Text>Загрузка...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Все мероприятия</Text>
      {events.map(event => (
        <Card key={event.id} style={{ marginBottom: 12, padding: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{event.title}</Text>
          <Text>{new Date(event.event_date).toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
            <Button
              mode="outlined"
              onPress={() => router.push(`/(admin)/edit-event/${event.id}`)}
            >
              ✏️ Редактировать
            </Button>
            <Button
              mode="contained"
              buttonColor="red"
              textColor="white"
              onPress={() => handleDelete(event.id)}
            >
              🗑️ Удалить
            </Button>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
