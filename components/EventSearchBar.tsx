import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  searchValue: string;
  onSearchChange: (text: string) => void;
  onOpenFilters?: () => void;
};

export function EventSearchBar({ searchValue, onSearchChange, onOpenFilters }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, paddingHorizontal: 12 }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 10,
          paddingHorizontal: 10,
          height: 40,
        }}
      >
        <MaterialIcons name="search" size={20} color="green" />
        <TextInput
          placeholder="Поиск мероприятий"
          value={searchValue}
          onChangeText={onSearchChange}
          style={{ flex: 1, marginLeft: 8, color: '#333', }}
          placeholderTextColor="#999"
      
        />
      </View>

      {onOpenFilters && (
  <TouchableOpacity onPress={onOpenFilters} style={{ marginLeft: 12 }}>
    <Text style={{ color: 'green', fontSize: 16, fontWeight: '500' }}>Фильтры</Text>
  </TouchableOpacity>
)}
    </View>
  );
}
