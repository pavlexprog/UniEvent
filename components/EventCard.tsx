import { View, Image, Pressable, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Event } from '../types';
import { BASE_URL } from '../lib/config';
import { MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { CustomAdminMenu } from './CustomAdminMenu';
import { Animated } from 'react-native';
import { useEffect} from 'react';
import { Linking } from 'react-native';

type Props = {
  event: Event;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPressDetails?: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onLongPress?: () => void;
  
isSelected?: boolean;
selectionMode?: boolean;
showMenuForUserOnlyHere?: boolean;
};

export function EventCard({
  event,
  isFavorite = false,
  onToggleFavorite,
  onPressDetails,
  isAdmin = false,
  onEdit,
  onDelete,
  onApprove,
  showMenuForUserOnlyHere = false,
  onLongPress,          // <--- добавь
  isSelected = false,
     // <--- добавь (с дефолтным значением)
  //selectionMode = false // <--- можно тоже с дефолтом
  
}: Props) {
const imageSource =
  Array.isArray(event.image_url) && event.image_url.length > 0
    ? {
        uri: event.image_url[0].startsWith('http')
          ? event.image_url[0]
          : `${BASE_URL}${event.image_url[0]}`,
      }
    : null;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<View>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 0.5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -0.5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shakeAnim.stopAnimation();
      shakeAnim.setValue(0);
    }
  }, [isSelected]);

  const openMenu = () => {
    if (menuButtonRef.current) {
      requestAnimationFrame(() => {
        menuButtonRef.current?.measure((fx, fy, width, height, px, py) => {
          setMenuPosition({ top: py + height + 4, left: px - 160 + width });
          setMenuVisible(true);
        });
      });
    }
  };

  return (
    <>
    <Animated.View
  style={{
    transform: [
  
      {
        rotate: shakeAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-1deg', '1deg'],
        }),
      },
    ],
  }}
>
   <TouchableOpacity
  onPress={() => {
  if (event.category === 'БелГУТ' && event.url) {
    Linking.openURL(event.url);
  } else {
    onPressDetails?.();
  }
}}
  onLongPress={onLongPress}
  style={{
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: isSelected ? '#ddd' : 'white',
    elevation: isSelected ? 5 : 2,
    padding: 8,
    alignItems: 'center',
    transform: [{ scale: isSelected ? 1.02 : 1 }],
  }}
>
        {/* Картинка или иконка */}
        {imageSource ? (
          <Image
            source={imageSource}
            style={{ width: 100, height: 100, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 8,
              backgroundColor: '#eee',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialIcons name="event" size={40} color="#aaa" />
          </View>
        )}

        {/* Контент */}
        <View style={{ flex: 1, marginLeft: 12, position: 'relative' }}>
          {/* Звезда */}
          {onToggleFavorite && (
            <Pressable
              onPress={onToggleFavorite}
              style={{
                position: 'absolute',
                top: -4,
                right: 0,
                padding: 4,
                zIndex: 10,
              }}
            >
              <MaterialIcons
                name={isFavorite ? 'star' : 'star-border'}
                size={24}
                color={isFavorite ? 'gold' : 'gray'}
              />
            </Pressable>
          )}

          {/* Заголовок и кнопка меню */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontWeight: 'bold',
                color: '#101010',
                fontSize: 16,
                flex: 1,
                paddingRight: 32,
              }}
              numberOfLines={2}
            >
              {event.title}
            </Text>

{(isAdmin || showMenuForUserOnlyHere) && (
  <View ref={menuButtonRef}>
    <Pressable onPress={openMenu} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
      <MaterialIcons name="more-vert" size={20} color="#555" />
    </Pressable>
  </View>
)}

          </View>

<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
  {event.category !== 'БелГУТ' && (
    <MaterialIcons name="calendar-today" size={16} color="#888" />
  )}
  <Text style={{ marginLeft: event.category !== 'БелГУТ' ? 4 : 0, color: '#666' }}>
    {event.category === 'БелГУТ'
      ? `Опубликовано: ${event.event_date}`
      : new Date(event.event_date).toLocaleString('ru-RU', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        })}
  </Text>
</View>

          <Text style={{ color: '#444', marginTop: 4 }}>{event.category}</Text>

          {event.category === 'БелГУТ' ? (
  <Text style={{ color: '#888', marginTop: 4 }}>Подробности на сайте</Text>
) : (
  <Text style={{ color: '#888', marginTop: 4 }}>
    {event.participants_count > 0 ? `Участников: ${event.participants_count}` : 'Пока нет участников'}
  </Text>
)}
        </View>
      </TouchableOpacity>
      </Animated.View>

      {/* Меню администратора */}
      {(isAdmin || showMenuForUserOnlyHere) && (
       <CustomAdminMenu
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  top={menuPosition.top}
  left={menuPosition.left}
  // Передавать одобрение только если событие НЕ одобрено
  onApprove={isAdmin && event.is_approved !== true ? () => {
  setMenuVisible(false);
  onApprove?.();
} : undefined}
  // Разрешить редактировать только если НЕ одобрено
  onEdit={event.is_approved !== true ? () => {
    setMenuVisible(false);
    onEdit?.();
  } : undefined}
  // Удаление разрешено всегда
  onDelete={() => {
    setMenuVisible(false);
    onDelete?.();
  }}
/>
      )}
    </>
  );
}
