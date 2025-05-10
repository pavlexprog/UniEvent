// components/EventCard.tsx
import { Card, Button, Text } from 'react-native-paper';
import { Image } from 'react-native';
import { Event } from '../types';
import { useRouter } from 'expo-router';

type Props = {
  event: Event;
};

export default function EventCard({ event }: Props) {
  const router = useRouter();

  return (
    <Card style={{ marginBottom: 16 }}>
      {event.image_url && (
        <Image
          source={{ uri: event.image_url }}
          style={{
            width: '100%',
            height: 180,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
          resizeMode="cover"
        />
      )}
      <Card.Content style={{ padding: 12 }}>
        <Text variant="titleMedium">{event.title}</Text>
        <Text style={{ marginVertical: 4 }}>
          {new Date(event.event_date).toLocaleString()}
        </Text>
        <Text>{event.category}</Text>
        <Button onPress={() => router.push(`/events/${event.id}`)} style={{ marginTop: 8 }}>
          Подробнее
        </Button>
      </Card.Content>
    </Card>
  );
}
