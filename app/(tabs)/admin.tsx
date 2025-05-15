import { useEffect, useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Event } from '../../types';
import { EventCard } from '../../components/EventCard';

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

  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/events/${id}`, { is_approved: true });
      setEvents(prev =>
        prev.map(e => (e.id === id ? { ...e, is_approved: true } : e))
      );
      Alert.alert('Успешно', 'Мероприятие одобрено');
    } catch {
      Alert.alert('Ошибка', 'Не удалось одобрить мероприятие');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) return <Text>Загрузка...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
     
      {events.map(event => (
       <EventCard
       key={event.id}
       event={event}
       isAdmin
       onEdit={() => router.push(`/(admin)/edit-event/${event.id}`)}
       onDelete={() => handleDelete(event.id)}
       onApprove={() => handleApprove(event.id)}
       onPressDetails={() => router.push(`/events/${event.id}?admin=true`)} // передаём метку админа
     />
      ))}
    </ScrollView>
  );
}
