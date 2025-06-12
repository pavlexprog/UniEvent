import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Share,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Event, FriendshipStatus } from '../../types';
import { BASE_URL } from '../../lib/config';
import { MaterialIcons } from '@expo/vector-icons';
import { FlatList, Modal } from 'react-native';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import EventOrganizerCard from '@/components/EventOrganizerCard';
import UserCard from '@/components/UserCard';
import { useAuthContext } from '@/contexts/AuthContext';
import CommentItem from '../../components/CommentItem'; 
import CommentList from '../../components/CommentList'
const screenWidth = Dimensions.get('window').width;

type EventWithJoined = Event & { joined?: boolean };

export default function EventDetailScreen() {

  const router = useRouter();
  //const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attending, setAttending] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [otherEvents, setOtherEvents] = useState<Event[]>([]);
  const { user: authUser } = useAuthContext();

  const { toggleFavorite, isFavorite, favorites, fetchFavorites} = useFavorites();
  //const openFullscreen = (index: number) => setSelectedImageIndex(index);
  //const closeFullscreen = () => setSelectedImageIndex(null);

    const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<EventWithJoined | null>(null);

  const [friendshipStatus, setFriendshipStatus] =
    useState<FriendshipStatus>('none');
  const [mutualFriends, setMutualFriends] = useState(0);
  
  const joined = event?.joined ?? false;
const [commentText, setCommentText] = useState('');
const [comments, setComments] = useState<{ id: number; text: string; author: string; date: string }[]>([]);
const handleDeleteEvent = () => {
  Alert.alert(
    'Удаление мероприятия',
    'Вы уверены, что хотите удалить это мероприятие?',
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/events/${event?.id}`);
            Alert.alert('Успешно', 'Мероприятие удалено');
            router.back();  // возвращаемся назад после удаления
          } catch (err) {
            console.error(err);
            Alert.alert('Ошибка', 'Не удалось удалить мероприятие');
          }
        },
      },
    ]
  );
};


  const handleToggleFavorite = () => {
    if (!id || Array.isArray(id)) return;
    toggleFavorite(Number(id));
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );
  


  
  const fetchEvent = async () => {
    if (!id || Array.isArray(id)) return;
  
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
      //setIsFavorite(res.data.is_favorite);
      
if (res.data.creator?.id && res.data.creator.id !== authUser?.id) {
  const fRes = await api.get(`/friends/status/${res.data.creator.id}`);
  setFriendshipStatus(fRes.data.status);

  const mRes = await api.get(`/friends/mutual/${res.data.creator.id}`);
  setMutualFriends(mRes.data.length);
} else {

  
  setMutualFriends(0);
}




      //setIsFavorite(res.data.is_favorite);

      // другие мероприятия
      if (res.data.creator?.id) {
        //const other = await api.get(`/events?creator_id=${res.data.creator.id}&limit=3`);
        const other = await api.get(`/events?category=${res.data.category}&limit=6`);

        setOtherEvents(other.data.filter((e: Event) => e.id !== Number(id)));
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось загрузить мероприятие');
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {

  fetchEvent();
   //fetchComments(); 
}, [id, favorites]);
const fetchComments = async () => {
  try {
    const res = await api.get(`/events/${id}/comments`);
    setComments(res.data); // Предполагается, что это массив комментариев
  } catch (err) {
    console.error(err);
    Alert.alert('Ошибка', 'Не удалось загрузить комментарии');
  }
};
const handleSendRequest = async (uid: number) => {
    await api.post(`/friends/${uid}`);
    setFriendshipStatus('outgoing');
  };

  const handleRemoveFriend = async (uid: number) => {
    await api.delete(`/friends/${uid}`);
    setFriendshipStatus('none');
  };

  const handleAccept = async (uid: number) => {
    await api.post(`/friends/${uid}/accept`);
    setFriendshipStatus('friends');
  };

  const handleCancelRequest = async (uid: number) => {
    await api.delete(`/friends/${uid}/request`);
    setFriendshipStatus('none');
  };



  const handleAttend = async () => {
    try {
      setAttending(true);
      await api.post(`/events/${id}/attend`);
      Alert.alert('Успешно', 'Вы записались на мероприятие');
      await fetchEvent();
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось записаться');
    } finally {
      setAttending(false);
    }
  };
  const handleCancel = async () => {
    Alert.alert(
      "Отмена записи",
      "Вы действительно хотите отменить участие в мероприятии?",
      [
        { text: "Нет", style: "cancel" },
        {
          text: "Да",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post(`/events/${id}/cancel`);
              Alert.alert("Отменено", "Вы отменили участие");
              await fetchEvent();
             
            } catch (err) {
              console.error(err);
              Alert.alert("Ошибка", "Не удалось отменить запись");
            }
          },
        },
      ]
    );
  };
  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Приглашаю на мероприятие "${event.title}" — ${event.description}`,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18 }}>Мероприятие не найдено</Text>
      </View>
    );
  }

 // const eventImage = event.image_url ? `${BASE_URL}${event.image_url}` : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Верхняя панель */}
      <View
        style={{
          height: 56,
          backgroundColor: '#fff',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderColor: '#eee',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ fontSize: 18, fontWeight: '500', flex: 1, textAlign: 'center', marginHorizontal: 12 }}
        >
          {event.title}
        </Text>
        {event.is_approved && (
  <TouchableOpacity onPress={handleShare}>
    <MaterialIcons name="share" size={22} />
  </TouchableOpacity>
)}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Картинка мероприятия — листаемая и с полноэкранным просмотром */}
{event.image_url && event.image_url.length > 0 ? (
  <>
   <View>
  <FlatList
    data={event.image_url ?? []}
    horizontal
    pagingEnabled
    keyExtractor={(item, index) => index.toString()}
    onScroll={(e) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
      setCurrentImageIndex(index);
    }}
    renderItem={({ item, index }) => (
      <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
        <Image
          source={{ uri: `${BASE_URL}${item}` }}
          style={{ width: screenWidth, height: 240 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    )}
    showsHorizontalScrollIndicator={false}
  />

  {/* Счётчик теперь вне FlatList — не скроллится с картинками */}
  <View
    style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    }}
  >
    <Text style={{ color: 'white', fontSize: 14 }}>
      {currentImageIndex + 1} / {event.image_url?.length ?? 0}
    </Text>
  </View>
</View>
{authUser?.is_admin && (
  <TouchableOpacity
    style={{
      position: 'absolute',
      top: 8,
      right: 16,
      backgroundColor: '#fff',
      borderRadius: 28,
      padding: 8,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    }}
    onPress={handleDeleteEvent}
  >
    <MaterialIcons
      name="delete"
      size={32}
      color="#e53935"
    />
  </TouchableOpacity>
)}

    {/* Звезда поверх изображений */}
{event.is_approved && (
  <TouchableOpacity
    style={{
      position: 'absolute',
      top: 200,
      right: 16,
      backgroundColor: '#fff',
      borderRadius: 28,
      padding: 8,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    }}
    onPress={handleToggleFavorite}
  >
    <MaterialIcons
      name={isFavorite(Number(id)) ? "star" : "star-border"}
      size={32}
      color="gold"
    />
  </TouchableOpacity>
)}
  </>
) : (
  <View
    style={{
      width: screenWidth,
      height: 240,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
    }}
  >
    <MaterialIcons name="event" size={72} color="#bbb" />
  </View>
)}



        {/* Информация о мероприятии */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{event.title}</Text>
          
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 4 }}>
          
              {new Date(event.event_date).toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          <Text style={{ fontSize: 16, marginBottom: 4 }}>{event.category}</Text>

         <TouchableOpacity onPress={() => router.push(`/events/${event.id}/EventParticipantsScreen`)}>
  <Text style={{ fontSize: 16, marginBottom: 12, color: '#007AFF' }}>
    Участников: {event.participants_count}
  </Text>
</TouchableOpacity>

       
          <View style={{ marginTop: 4, borderTopWidth: 1, borderColor: '#eee', paddingTop: 16 }}>
  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Описание</Text>
  <Text style={{ fontSize: 16, lineHeight: 22, color: '#444' }}>
    {event.description}
  </Text>
    <Text style={{ fontSize: 16, fontWeight: '600', paddingTop: 8, marginBottom: 8}}>Организатор</Text>


  
{event.creator && (
  <View>
    

<UserCard
  user={event.creator}
  friendshipStatus={friendshipStatus}
  onAccept={() => handleAccept(event.creator.id)}
  onCancelRequest={() => handleCancelRequest(event.creator.id)}
  onRemoveFriend={() => handleRemoveFriend(event.creator.id)}
  onSendRequest={() => handleSendRequest(event.creator.id)}
 mutualFriendsCount={
  authUser && event.creator.id !== authUser.id ? mutualFriends : undefined
}
  showEventCount
  showMutualFriends={authUser ? event.creator.id !== authUser.id : false} 
  isCurrentUser={!!authUser && event.creator.id === authUser.id }
  labelIfCurrentUser="Это вы"
/>
  </View>
)}
</View>

        </View>
{/* 
{event.creator && (
  <EventOrganizerCard
    creator={event.creator}
    friendshipStatus={getFriendshipStatus(event.creator.id)} // 👈 сюда передаёшь статус
    onAddFriend={() => handleAddFriend(event.creator.id)}
    onRemoveFriend={() => handleRemoveFriend(event.creator.id)}
    onAccept={() => handleAcceptRequest(event.creator.id)}
    onCancelRequest={() => handleCancelRequest(event.creator.id)}
  />
)} */}





{otherEvents.length > 0 && event.is_approved && (
  <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Другие мероприятия в этой категории</Text>
    {otherEvents.map((e) => (
      <TouchableOpacity
        key={e.id}
        onPress={() => router.push(`/events/${e.id}`)}
        style={{
          flexDirection: 'row',
          marginBottom: 12,
          backgroundColor: '#f8f8f8',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: e.image_url ? `${BASE_URL}${e.image_url}` : 'https://via.placeholder.com/150' }}
          style={{ width: 100, height: 80 }}
        />
        <View style={{ flex: 1, padding: 8 }}>
          <Text style={{ fontWeight: '600', marginBottom: 4 }}>{e.title}</Text>
          <Text style={{ color: '#666' }}>
            {new Date(e.event_date).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long',
              hour: '2-digit', minute: '2-digit'
            })}
          </Text>
          <Text style={{ fontSize: 12, color: '#999' }}>{e.location}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
)}
<View style={{ padding: 16 }}>
  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Комментарии</Text>
  <CommentList eventId={Number(id)} />
</View>
      </ScrollView>
     
      
     
      {/* Нижняя кнопка */}
{event.is_approved && (
  <View style={{ position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 10 }}>
    {!joined ? (
      <TouchableOpacity
        style={{
          backgroundColor: '#2e7d32',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={handleAttend}
        disabled={attending}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          {attending ? 'Запись...' : 'Я пойду'}
        </Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={{
          backgroundColor: '#e53935',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={handleCancel}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Отменить участие
        </Text>
      </TouchableOpacity>
    )}
  </View>
)}




<Modal visible={selectedImageIndex !== null} transparent={true}>
  <View style={{ flex: 1, backgroundColor: 'black' }}>
    <FlatList
      data={event.image_url}
      horizontal
      pagingEnabled
      initialScrollIndex={selectedImageIndex ?? 0}
      onScroll={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
        setCurrentImageIndex(index);
      }}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View>
          <Image
            source={{ uri: `${BASE_URL}${item}` }}
            style={{ width: screenWidth, height: '100%' }}
            resizeMode="contain"
          />
        </View>
      )}
      getItemLayout={(_, index) => ({
        length: screenWidth,
        offset: screenWidth * index,
        index,
      })}
    />

    {/* Счётчик внизу слева */}
    <View style={{
      position: 'absolute',
      bottom: 30,
      left: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    }}>
      <Text style={{ color: 'white', fontSize: 14 }}>
        {currentImageIndex + 1} / {event.image_url?.length ?? 0}
      </Text>
    </View>

    {/* Кнопка закрытия */}
    <TouchableOpacity
      onPress={() => setSelectedImageIndex(null)}
      style={{
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 20,
      }}
    >
      <MaterialIcons name="close" size={28} color="white" />
    </TouchableOpacity>
  </View>
</Modal>


    
    </SafeAreaView>
  );
}
