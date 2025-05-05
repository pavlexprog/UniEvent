//app/(admin)/edit-event/[id].tsx
import { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../lib/api';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(res => {
        const e = res.data;
        setTitle(e.title);
        setDescription(e.description);
        setDate(e.date);
        setCategory(e.category);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/events/${id}`, {
        title,
        description,
        date,
        category,
      });

      Alert.alert('Успех', 'Мероприятие обновлено');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось обновить мероприятие');
    }
  };

  if (loading) return <Text>Загрузка...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 12 }}>Редактировать мероприятие</Text>

        <TextInput
          label="Название"
          value={title}
          onChangeText={setTitle}
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Дата (YYYY-MM-DD HH:MM)"
          value={date}
          onChangeText={setDate}
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Категория"
          value={category}
          onChangeText={setCategory}
          style={{ marginBottom: 12 }}
        />

        <Button mode="contained" onPress={handleSave}>Сохранить</Button>
      </Card>
    </ScrollView>
  );
}
