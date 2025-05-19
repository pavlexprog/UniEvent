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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/contexts/AuthContext';


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
  const insets = useSafeAreaInsets();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated} = useAuthContext();
  
  const loadEvents = async () => {
    try {
      //  const res = await api.get('/events?order=desc&sort_by=event_date&limit=10');
      const res = await api.get('/events?is_approved=true&order=desc&sort_by=event_date&limit=10');
      setEvents(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке мероприятий', err);
    } finally {
      setLoading(false);
    }
  };


   
    
   
  

      const handleToggleFavorite = (eventId: number) => {
        if (!isAuthenticated || !user) {
          setShowAuthModal(true);
          return;
        }
        toggleFavorite(eventId);
      };
      
      const handlePressDetails = (eventId: number) => {
        if (!isAuthenticated || !user) {
          setShowAuthModal(true);
          return;
        }
        router.push(`/events/${eventId}`);
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
      <View
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: insets.top - 8, // отступ от чёлки/статус-бара
      paddingBottom: 0, // минимальный нижний отступ
      backgroundColor: 'white',
      zIndex: 10,
      padding: 16,
      borderBottomWidth: 1,
      borderColor: '#ddd',
    }}
  >
    <EventSearchBar
      searchValue={search}
      onSearchChange={setSearch}
      onOpenFilters={() => setFiltersVisible(true)}
    />
  </View>
      <FlatList
        data={events.filter(event =>
          event.title.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          progressViewOffset={insets.top + 80} // 👈 сдвигаем индикатор вниз
          />
      
        }
        contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <EventCard
  event={item}
  onToggleFavorite={() => handleToggleFavorite(item.id)}
  onPressDetails={() => handlePressDetails(item.id)}
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
    <Modal visible={showAuthModal} transparent animationType="fade">
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
    <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, marginHorizontal: 20 }}>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
        Вы не вошли в аккаунт.{' '}
        <Text style={{ color: '#1e88e5' }} onPress={() => {
          setShowAuthModal(false);
          router.push('/auth/login');
        }}>
          Войдите
        </Text>{' '}
        или{' '}
        <Text style={{ color: '#1e88e5' }} onPress={() => {
          setShowAuthModal(false);
          router.push('/auth/register');
        }}>
          зарегистрируйтесь
        </Text>, чтобы использовать все возможности приложения.
      </Text>
      <Button onPress={() => setShowAuthModal(false)}>Закрыть</Button>
    </View>
  </View>
</Modal>

    </>
  );
}
