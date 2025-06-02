// components/FilterModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortBy: 'date' | 'popularity';
  setSortBy: (value: 'date' | 'popularity') => void;
  onApplyFilters: () => void;
};

export const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  onApplyFilters,
}) => {
  const categories = ['Концерт', 'Спорт', 'Кино', 'Театр', 'Выставка', 'Образование', 'БелГУТ', 'Другое'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' }}>
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: '#fff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                maxHeight: '80%',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 20 }}>
                <MaterialCommunityIcons name="filter" size={22} /> Фильтры
              </Text>

              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Категория</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    style={{
                      backgroundColor: selectedCategory === cat ? '#1e88e5' : '#eee',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 20,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: selectedCategory === cat ? '#fff' : '#333' }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>
                Сортировать по
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setSortBy('date')}
                  style={{
                    backgroundColor: sortBy === 'date' ? '#1e88e5' : '#eee',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ color: sortBy === 'date' ? '#fff' : '#333' }}>
                    <MaterialCommunityIcons name="calendar" size={16} /> Ближайшие
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortBy('popularity')}
                  style={{
                    backgroundColor: sortBy === 'popularity' ? '#1e88e5' : '#eee',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ color: sortBy === 'popularity' ? '#fff' : '#333' }}>
                    <MaterialCommunityIcons name="fire" size={16} /> Популярные
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                <TouchableOpacity onPress={onClose}>
                  <Text style={{ fontSize: 16, color: '#1e88e5' }}>Закрыть</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onApplyFilters();
                    onClose();
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e88e5' }}>Применить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
