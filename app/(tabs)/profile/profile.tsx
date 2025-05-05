import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { api } from '../../../lib/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userRes = await api.get('/me');
        setUser(userRes.data);

        // Предположим, что на бэке есть такой маршрут:
        //const eventsRes = await api.get('/users/me/events');
        const eventsRes = await api.get('/events'); // или []
        setEvents(eventsRes.data);
      } catch (err) {
        console.error('Ошибка загрузки профиля', err);
      }
    };

    loadUserData();
  }, []);

  if (!user) return <Text>Загрузка профиля...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>Профиль</Text>
      <Text>Имя: {user.username}</Text>
      <Text>Дата регистрации: {new Date(user.created_at).toLocaleDateString()}</Text>

      <Text style={{ marginTop: 20, fontSize: 18, fontWeight: 'bold' }}>
        Записанные мероприятия:
      </Text>

      {events.map(event => (
        <Card key={event.id} style={{ marginTop: 10, padding: 12 }}>
          <Text style={{ fontWeight: 'bold' }}>{event.title}</Text>
          <Text>{event.date}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
