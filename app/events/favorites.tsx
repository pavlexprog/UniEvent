import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../contexts/FavoritesContext';
import { api } from '../../lib/api';
import {EventCard} from '../../components/EventCard'; // путь может отличаться

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavoriteEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/favorites');
      setFavoriteEvents(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке избранных мероприятий:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavoriteEvents();
  }, []);

  const handleToggleFavorite = async (eventId: number) => {
    await toggleFavorite(eventId);
    loadFavoriteEvents(); // обновляем список после удаления
  };

  const renderItem = ({ item }: { item: any }) => (
    <EventCard
      event={item}
      isFavorite={isFavorite(item.id)}
      onToggleFavorite={() => handleToggleFavorite(item.id)}
      onPressDetails={() => router.push(`/events/${item.id}`)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
      {/* Заголовок и стрелка назад */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Избранные мероприятия</Text>
      </View>

      {/* Контент */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1e88e5" />
        </View>
      ) : favoriteEvents.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>У вас пока нет избранных мероприятий.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteEvents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
