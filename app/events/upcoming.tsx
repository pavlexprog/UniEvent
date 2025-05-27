import { useAuthContext } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Event } from "@/types";
import { EventCard } from "@/components/EventCard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function UpcomingEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const { favorites, toggleFavorite, isFavorite, fetchFavorites} = useFavorites();
 
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const { user, isAuthenticated} = useAuthContext();
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
    const fetchJoinedEvents = async () => {
      try {
        const res = await api.get(`/events/joined`);
        setEvents(res.data);
      } catch (err) {
        console.error('Ошибка загрузки предстоящих мероприятий', err);
      }
    };

    if (user) fetchJoinedEvents();
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f4', paddingTop: 50 }}>
      {/* Шапка */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>
          Предстоящие мероприятия
        </Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
         <EventCard
  event={item}
  onToggleFavorite={() => handleToggleFavorite(item.id)}
  onPressDetails={() => handlePressDetails(item.id)}
  isFavorite={isFavorite(item.id)}
/>
        )}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 32 }}>
            Вы пока не записались на мероприятия
          </Text>
        }
      />
    </View>
  );
}
