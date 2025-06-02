import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, FlatList, Modal, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Event, BsutEvent } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import { EventCard } from '../../components/EventCard';
import { EventSearchBar } from '../../components/EventSearchBar'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { FilterModal } from '@/components/FilterModal'
export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  //const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');

  const [selectedCategory, setSelectedCategory] = useState('');
  const insets = useSafeAreaInsets();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated} = useAuthContext();
  const { favorites, toggleFavorite, isFavorite, fetchFavorites} = useFavorites();
  const [tempSortBy, setTempSortBy] = useState(sortBy);
 const [tempCategory, setTempCategory] = useState(selectedCategory);
  
 const applyFilters = () => {
  setSortBy(tempSortBy);
  setSelectedCategory(tempCategory);
};
 
const loadEvents = async () => {
  try {
    if (selectedCategory === 'БелГУТ') {
      const res = await api.get('/bsut-events');
      const eventsArray = Object.values(res.data) as BsutEvent[];

      const mappedEvents: Event[] = eventsArray.map((e, index) => ({
        id: 10000 + index,
        title: e.title,
        description: '',
        event_date: e.date,
        category: 'БелГУТ',
        created_at: e.date,
        
        creator: {
          id: 0,
          username: 'bsut',
          first_name: 'БелГУТ',
          last_name: '',
          email: 'info@bsut.by',
          is_admin: false,
          avatar_url: undefined, // ✅ исправлено
          created_at: new Date().toISOString(),
          attended_event_ids: [],
          registered_events: [],
          total_events: 0,
        },
        image_url: [e.image],
        location: 'БелГУТ',
        participants: [],
        is_approved: true,
        participants_count: 0,
        joined: false,
        url: e.event_link,
        
      }));

      setEvents(mappedEvents); // ✅ здесь используем mappedEvents
    } else {
      let url = '/events?is_approved=true';

      if (sortBy === 'date') {
        url += '&order=asc&sort_by=event_date';
      } else if (sortBy === 'popularity') {
        url += '&order=desc&sort_by=popularity';
      }

      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const res = await api.get(url);
      setEvents(res.data); // ✅ здесь — обычные события
    }
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
  

   
    
   
  

      // const handleToggleFavorite = (eventId: number) => {
      //   if (!isAuthenticated || !user) {
      //     setShowAuthModal(true);
      //     return;
      //   }
      //   toggleFavorite(eventId);
      // };
      
      const handlePressDetails = (eventId: number) => {
        if (!isAuthenticated || !user) {
          setShowAuthModal(true);
          return;
        }
        router.push(`/events/${eventId}`);
      };



  useEffect(() => {
    loadEvents();
    
  },  [sortBy, selectedCategory]);
  const onRefresh = useCallback(() => {
  setRefreshing(true);
  loadEvents().finally(() => setRefreshing(false));
}, [sortBy, selectedCategory]);
useFocusEffect(
  useCallback(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated])
);

  // const fetchFavorites = async () => {
  //   const res = await api.get('/favorites'); // список id
  //   setFavorites(res.data.map((f: any) => f.event_id));
  // };

  // const toggleFavorite = async (eventId: number) => {
  //   const isFav = favorites.includes(eventId);
  //   try {
  //     if (isFav) {
  //       await api.delete(`/events/${eventId}/favorite`);
  //       setFavorites(favorites.filter(id => id !== eventId));
  //     } else {
  //       await api.post(`/events/${eventId}/favorite`);
  //       setFavorites([...favorites, eventId]);
  //     }
  //   } catch (err) {
  //     console.error('Ошибка избранного', err);
  //   }
  // };
  

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
  isFavorite={isFavorite(item.id)}
/>
        )}
      />

      <FilterModal
  visible={filtersVisible}
  onClose={() => setFiltersVisible(false)}
  selectedCategory={tempCategory}
  setSelectedCategory={setTempCategory}
  sortBy={tempSortBy}
  setSortBy={setTempSortBy}
  onApplyFilters={applyFilters}
/>

  
     



<Modal visible={showAuthModal} transparent animationType="fade">
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
    <View
      style={{
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        marginHorizontal: 24,
        width: '85%',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        Требуется вход
      </Text>

      <Text style={{ fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 20 }}>
        <Text>Войдите </Text>
        <Text
          onPress={() => {
            setShowAuthModal(false);
            router.push('/auth/login');
          }}
          style={{ color: '#1e88e5', fontWeight: 'bold' }}
        >
          здесь
        </Text>
        <Text> или </Text>
        <Text
          onPress={() => {
            setShowAuthModal(false);
            router.push('/auth/register');
          }}
          style={{ color: '#1e88e5', fontWeight: 'bold' }}
        >
          зарегистрируйтесь
        </Text>, чтобы добавлять мероприятия в избранное и просматривать подробности.
      </Text>

      <TouchableOpacity
        onPress={() => setShowAuthModal(false)}
        style={{
          backgroundColor: '#1e88e5',
          paddingVertical: 10,
          paddingHorizontal: 32,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Позже</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>





    </>
  );
}
