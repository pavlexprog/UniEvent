import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, FlatList, Modal, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Event } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { EventCard } from '../../components/EventCard';
import { EventSearchBar } from '../../components/EventSearchBar'


export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  const categories = ['Все', 'Музыка', 'Спорт', 'Образование'];
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const loadEvents = async () => {
    try {
       const res = await api.get('/events?order=desc&sort_by=event_date&limit=10');
      //const res = await api.get('/events?is_approved=true&order=desc&sort_by=event_date&limit=10');
      setEvents(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке мероприятий', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    fetchFavorites();
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents().finally(() => setRefreshing(false));
  }, []);
  const fetchFavorites = async () => {
    const res = await api.get('/favorites'); // список id
    setFavorites(res.data.map((f: any) => f.event_id));
  };

  const toggleFavorite = async (eventId: number) => {
    const isFav = favorites.includes(eventId);
    try {
      if (isFav) {
        await api.delete(`/events/${eventId}/favorite`);
        setFavorites(favorites.filter(id => id !== eventId));
      } else {
        await api.post(`/events/${eventId}/favorite`);
        setFavorites([...favorites, eventId]);
      }
    } catch (err) {
      console.error('Ошибка избранного', err);
    }
  };
  

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={events.filter(event =>
          event.title.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            <EventSearchBar
              searchValue={search}
              onSearchChange={setSearch}
              onOpenFilters={() => setFiltersVisible(true)}
            />
          </>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onPressDetails={() => router.push(`/events/${item.id}`)}
          />
        )}
      />
  
      {/* Модальное окно фильтров */}
      <Modal visible={filtersVisible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000088' }}>
        <View style={{ backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Фильтры</Text>

          <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Категория</Text>
          <RadioButton.Group onValueChange={setSelectedCategory} value={selectedCategory}>
            {categories.map((cat) => (
              <RadioButton.Item key={cat} label={cat} value={cat} />
            ))}
          </RadioButton.Group>

          <Text style={{ marginBottom: 6, marginTop: 12, fontWeight: 'bold' }}>Сортировать по</Text>
          <TouchableOpacity onPress={() => setSortBy('date')}>
            <Text style={{ color: sortBy === 'date' ? 'green' : 'black' }}>📅 Дате</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('popularity')} style={{ marginTop: 8 }}>
            <Text style={{ color: sortBy === 'popularity' ? 'green' : 'black' }}>🔥 Популярности</Text>
          </TouchableOpacity>

          <Text
            style={{ marginTop: 20, textAlign: 'right', color: 'blue' }}
            onPress={() => setFiltersVisible(false)}
          >
            Закрыть
          </Text>
        </View>
      </View>
    </Modal>
    </>
  );
}
