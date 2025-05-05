import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Ошибка при получении мероприятий', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {events.map((event: any) => (
        <Card key={event.id} style={{ marginBottom: 16 }}>
          {event.image_url && (
            <Card.Cover source={{ uri: event.image_url }} />
          )}
          <Card.Title title={event.title} subtitle={`Категория: ${event.category}`} />
          <Card.Content>
            <Text>📍 {event.location || 'Место не указано'}</Text>
            <Text>🗓 {new Date(event.event_date).toLocaleString()}</Text>
            <Text>👥 {event.participants?.length || 0} участников</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => router.push(`/events/${event.id}`)}>Подробнее</Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}
