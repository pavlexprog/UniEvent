import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Alert, Pressable, RefreshControl, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Event } from '../../types';
import { EventCard } from '../../components/EventCard';
import { View, Button } from 'react-native';
import { useSelectionContext } from '../../contexts/SelectionContext';
import { MaterialIcons } from '@expo/vector-icons';
import { EventSearchBar } from '@/components/EventSearchBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';




export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { selectionMode, setSelectionMode } = useSelectionContext();
  const [showSelectionFooter, setShowSelectionFooter] = useState(false);
  const [search, setSearch] = useState('');
    const insets = useSafeAreaInsets();
    
  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
  );
};

  const handleLongPress = (id: number) => {
    console.log('LONG PRESS', id);
    setSelectionMode(true);
    setSelectedIds([id]);
};

 const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents().finally(() => setRefreshing(false));
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get('/events?is_approved=false&order=desc&sort_by=event_date&limit=10');
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
      await api.put(`/events/${id}`, { is_approved: true });
      setEvents(prev =>
        prev.map(e => (e.id === id ? { ...e, is_approved: true } : e))
      );
      Alert.alert('Успешно', 'Мероприятие одобрено');
    } catch (err) {
      console.error('Ошибка при одобрении:', err);
      Alert.alert('Ошибка', 'Не удалось одобрить мероприятие');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);
 
  useEffect(() => {
    let timeout: any;
    if (selectionMode) {
      timeout = setTimeout(() => {
        setShowSelectionFooter(true);
      }, 10); 
    } else {
      setShowSelectionFooter(false);
    }
    return () => clearTimeout(timeout);
  }, [selectionMode]);

  

  if (loading) return <Text>Загрузка...</Text>;

  return (
    
    <View style={{ flex: 1 }}>
      <View
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: insets.top - 8,
    paddingBottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  }}
>
  {/* Горизонтальный контейнер: поиск + кнопка */}
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {/* Поиск с flex: 1 */}
    <View style={{ flex: 1 }}>
      <EventSearchBar
        searchValue={search}
        onSearchChange={setSearch}
      />
    </View>

    {/* Кнопка "Выбрать" */}
    <Pressable
      onPress={() => {
        if (selectionMode) {
          setSelectionMode(false);
          setSelectedIds([]);
        } else {
          setSelectionMode(true);
        }
      }}
      style={{
        marginLeft: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
      }}
    >
      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
        {selectionMode ? 'Отмена' : 'Выбрать'}
      </Text>
    </Pressable>
  </View>
</View>

      {showSelectionFooter && (
  <View
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      backgroundColor: '#111', // чуть светлее чёрного
      borderTopWidth: 1,
      borderColor: '#333',
      justifyContent: 'center',
      paddingHorizontal: 20,
      zIndex: 20,
    }}
  >
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Заголовок по центру */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: 'white',
          textAlign: 'center',
          flex: 1,
        }}
      >
        Выбор объектов
      </Text>

      {/* Кнопки справа */}
      <View
        style={{
          flexDirection: 'row',
          position: 'absolute',
          right: 0,
          alignItems: 'center',
        }}
      >
        {/* Кнопка удаления */}
        <Pressable
          onPress={() => {
            if (selectedIds.length === 0) return;
            Alert.alert('Удалить выбранные?', '', [
              { text: 'Отмена', style: 'cancel' },
              {
                text: 'Удалить',
                style: 'destructive',
                onPress: async () => {
                  for (const id of selectedIds) {
                    try {
                      await api.delete(`/events/${id}`);
                    } catch {}
                  }
                  setEvents(prev => prev.filter(e => !selectedIds.includes(e.id)));
                  setSelectedIds([]);
                  setSelectionMode(false);
                },
              },
            ]);
          }}
          style={{ marginLeft: 12, padding: 6 }}
        >
          <MaterialIcons
            name="delete-forever"
            size={32}
            color={selectedIds.length === 0 ? '#555' : '#F44336'}
          />
        </Pressable>

        {/* Кнопка одобрения */}
        <Pressable
          onPress={async () => {
            if (selectedIds.length === 0) return;
            try {
              for (const id of selectedIds) {
                await api.put(`/events/${id}`, { is_approved: true });
              }
              setEvents(prev =>
                prev.map(e =>
                  selectedIds.includes(e.id) ? { ...e, is_approved: true } : e
                )
              );
              setSelectedIds([]);
              setSelectionMode(false);
              Alert.alert('Успешно', 'Выбранные мероприятия одобрены');
            } catch {
              Alert.alert('Ошибка', 'Не удалось одобрить некоторые мероприятия');
            }
          }}
          style={{ marginLeft: 12, padding: 6 }}
        >
          <MaterialIcons
            name="check-circle"
            size={28}
            color={selectedIds.length === 0 ? '#555' : '#4CAF50'}
          />
        </Pressable>
      </View>
    </View>
  </View>
)}



  
      {/* Контент со скроллом */}
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 72, paddingHorizontal: 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
        progressViewOffset={insets.top + 80} // 👈 сдвигаем индикатор вниз
        />
              }>
        {events
  .filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase())
  )
  .map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isAdmin
            onEdit={() => router.push(`/(admin)/edit-event/${event.id}`)}
            onDelete={() => handleDelete(event.id)}
            onApprove={() => handleApprove(event.id)}
            onPressDetails={() => {
              if (selectionMode) {
                toggleSelection(event.id);
              } else {
                router.push(`/events/${event.id}?admin=true`);
              }
            }}
            onLongPress={() => handleLongPress(event.id)}
            isSelected={selectedIds.includes(event.id)}
            selectionMode={selectionMode}
          />
        ))}
      </ScrollView>
    </View>
  );
} 