import { View, Image, Pressable, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Event } from '../types';
import { BASE_URL } from '../lib/config';
import { MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { CustomAdminMenu } from './CustomAdminMenu';

type Props = {
  event: Event;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPressDetails?: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
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
}: Props) {
  const imageSource = event.image_url
    ? { uri: `${BASE_URL}${event.image_url}` }
    : null;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<View>(null);

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
      <TouchableOpacity
        onPress={onPressDetails}
        style={{
          flexDirection: 'row',
          marginBottom: 16,
          borderRadius: 12,
          backgroundColor: 'white',
          elevation: 2,
          padding: 8,
          alignItems: 'center',
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
              }}
              numberOfLines={1}
            >
              {event.title}
            </Text>

            {isAdmin && (
              <View ref={menuButtonRef}>
                <Pressable onPress={openMenu}
                 hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <MaterialIcons name="more-vert" size={20} color="#555" />
                </Pressable>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialIcons name="calendar-today" size={16} color="#888" />
            <Text style={{ marginLeft: 4, color: '#666' }}>
              {new Date(event.event_date).toLocaleString()}
            </Text>
          </View>

          <Text style={{ color: '#444', marginTop: 4 }}>{event.category}</Text>

          <Text style={{ color: '#888', marginTop: 4 }}>
            Участников: {event.participants ?? 0}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Меню администратора */}
      {isAdmin && (
        <CustomAdminMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          top={menuPosition.top}
          left={menuPosition.left}
          onApprove={() => {
            setMenuVisible(false);
            onApprove?.();
          }}
          onEdit={() => {
            setMenuVisible(false);
            onEdit?.();
          }}
          onDelete={() => {
            setMenuVisible(false);
            onDelete?.();
          }}
        />
      )}
    </>
  );
}
