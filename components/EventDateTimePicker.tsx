import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/ru';

type Props = {
  date: Date | null;
  setDate: (date: Date) => void;
};

export default function EventDateTimePicker({ date, setDate }: Props) {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);

  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hidePicker();
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.label}>Дата и время мероприятия</Text>
      <TouchableOpacity style={styles.input} onPress={showPicker} activeOpacity={0.8}>
        <Ionicons name="calendar-outline" size={20} color="#666" style={{ marginRight: 8 }} />
        <Text style={styles.text}>
          {date
            ? moment(date).locale('ru').format('D MMMM YYYY, HH:mm')
            : 'Выберите дату и время'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        date={date || new Date()}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        is24Hour
        locale="ru-RU"
        minimumDate={new Date()}
        confirmTextIOS="Подтвердить"
        cancelTextIOS="Отмена"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
