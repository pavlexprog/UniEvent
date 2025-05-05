// app/(tabs)/create-event.tsx
import { useState } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!title || !description || !date || !category) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      const response = await api.post('/events/', {
        title,
        description,
        date: date.toISOString(), // ISO формат
        category,
      });

      Alert.alert('Успех', 'Мероприятие отправлено на модерацию');
      router.push('/(tabs)');
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось создать мероприятие');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 12 }}>Создать мероприятие</Text>

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
       <Text style={{ marginBottom: 4 }}>Категория</Text>
<View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 12 }}>
  <Picker
    selectedValue={category}
    onValueChange={(itemValue) => setCategory(itemValue)}
  >
    <Picker.Item label="Выберите категорию..." value="" />
    <Picker.Item label="Концерт" value="Концерт" />
    <Picker.Item label="Спорт" value="Спорт" />
    <Picker.Item label="Кино" value="Кино" />
    <Picker.Item label="Другое" value="Другое" />
  </Picker>
</View>

        <Button onPress={() => setShowPicker(true)} style={{ marginBottom: 12 }}>
          Выбрать дату и время
        </Button>
        <Text style={{ marginBottom: 12 }}>
          Выбрано: {date.toLocaleString()}
        </Text>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Button mode="contained" onPress={handleSubmit}>Создать</Button>
      </Card>
    </ScrollView>
  );
}
