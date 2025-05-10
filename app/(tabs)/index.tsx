import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Image, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Event } from '../../types';
import { BASE_URL } from '@/lib/config';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    router.replace('/auth/login');
  };

  const loadEvents = async () => {
    try {
      console.log("Запрос")
      const res = await api.get('/events?order=desc&sort_by=event_date&limit=10');
      setEvents(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке мероприятий', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadEvents();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents().finally(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />


       
      </View>
      
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        Ближайшие мероприятия
      </Text>
      <Button mode="outlined" onPress={handleLogout}>
        Выйти
      </Button>
      {events.map(event => (
        <Card key={event.id} style={{ marginBottom: 16, borderRadius: 12, elevation: 3 }}>
          {event.image_url && (
            <Image
              source={{ uri: `${BASE_URL}${event.image_url}` }}
              style={{
                width: '100%',
                height: 180,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
              resizeMode="cover"
            />
          )}
          <Card.Content style={{ padding: 12 }}>
            <Text variant="titleMedium">{event.title}</Text>
            <Text style={{ marginVertical: 4, color: '#666' }}>
              {new Date(event.event_date).toLocaleString()}
            </Text>
            <Text style={{ fontStyle: 'italic' }}>{event.category}</Text>
            <Button
              mode="outlined"
              onPress={() => router.push(`/events/${event.id}`)}
              style={{ marginTop: 8 }}
            >
              Подробнее
            </Button>
          </Card.Content>
          
        </Card>
        
      ))}
    </ScrollView>
  );
}