import { useAuthContext } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextStyle } from "react-native";
import { Event } from "@/types";
import { EventCard } from "@/components/EventCard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
type Tab = 'approved' | 'pending';


type Props = {
  myEvents: Event[];
  onDelete: (id: number) => void;
};

export default function MyEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab>('approved');

  const { user } = useAuthContext();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get(`/events/by-user/${user?.id}`);
        setEvents(res.data);
      } catch (err) {
        console.error('Ошибка загрузки мероприятий', err);
      }
    };

    if (user) fetchEvents();
  }, [user]);

  const approvedEvents = events.filter(e => e.is_approved);
  const pendingEvents = events.filter(e => !e.is_approved);

  const getTabStyle = (tab: Tab): TextStyle => ({
  fontWeight: selectedTab === tab ? 'bold' as const : 'normal' as const,
  color: selectedTab === tab ? '#000' : '#888',
  paddingVertical: 8,
  paddingHorizontal: 16,
});
const handleDelete = async (id: number) => {
  try {
    await api.delete(`/events/${id}`);
    setEvents(prev => prev.filter(event => event.id !== id));
  } catch (err) {
    console.error("Ошибка при удалении", err);
  }
};

  const displayedEvents = selectedTab === 'approved' ? approvedEvents : pendingEvents;

  return (
     <View style={{ flex: 1, backgroundColor: '#f4f4f4', paddingTop: 50 }}>
      {/* Шапка */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>
          Мои мероприятия
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
<TouchableOpacity onPress={() => setSelectedTab('approved')}>
  <View style={{ alignItems: 'center', borderBottomWidth: selectedTab === 'approved' ? 2 : 0, borderBottomColor: '#00b894' }}>
    <Text style={getTabStyle('approved')}>Активные</Text>
    <Text>{approvedEvents.length}</Text>
  </View>
</TouchableOpacity>

       <TouchableOpacity onPress={() => setSelectedTab('pending')}>
  <View style={{
    alignItems: 'center',
    borderBottomWidth: selectedTab === 'pending' ? 2 : 0,
    borderBottomColor: '#00b894',
  }}>
    <Text style={getTabStyle('pending')}>На модерации</Text>
    <Text>{pendingEvents.length}</Text>
  </View>
</TouchableOpacity>
      </View>

      <FlatList
        data={displayedEvents}
        keyExtractor={item => item.id.toString()}
       renderItem={({ item }) => (
  <EventCard
  event={item}
  isAdmin={user?.is_admin === true} // ✅ передаём реальный статус
  showMenuForUserOnlyHere={!user?.is_admin}
  onPressDetails={() => router.push(`/events/${item.id}`)}
  onEdit={!item.is_approved ? () => router.push(`/edit-event/${item.id}`) : undefined}
  onDelete={() => handleDelete(item.id)}
/>
)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 32 }}>
            Нет мероприятий
          </Text>
        }
      />
    </View>
  );
}
