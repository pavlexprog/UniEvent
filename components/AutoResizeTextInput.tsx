import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface Props {
  description: string;
  setDescription: (text: string) => void;
}

const AutoResizeTextInput = ({ description, setDescription }: Props) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: 'black' }}>
        Описание
      </Text>

      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Описание мероприятия"
        placeholderTextColor="#999999"
        cursorColor="black"
        style={{
          backgroundColor: '#f5f5f5',
          padding: 14,
          borderRadius: 12,
          fontSize: 14,
          height: 140, // фиксированная высота, как ты просил
          color: 'black',
          textAlignVertical: 'top',
        }}
        maxLength={4000}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 12, color: '#999' }}>Обязательное поле</Text>
        <Text style={{ fontSize: 12, color: '#999' }}>{description.length}/4000</Text>
      </View>
    </View>
  );
};

export default AutoResizeTextInput;
