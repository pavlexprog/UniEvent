import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import ImageViewing from 'react-native-image-viewing';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';


type PhotoUploadProps = {
  images: string[];
  setImages: (images: string[]) => void;
  max?: number;
};

const screenWidth = Dimensions.get('window').width;

export default function PhotoUpload({ images, setImages, max = 9 }: PhotoUploadProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Разрешите доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: spaceLeft,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages].slice(0, max));
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };
  const spaceLeft = max - images.length;

  return (
    <View style={{ paddingVertical: 16 }}>
      {/* Header */}
      <View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline', // вместо 'center'
    marginBottom: 12,
  }}
>
  <Text style={{ fontSize: 20, fontWeight: '600' }}>Фотографии</Text>
  <Text style={{ fontSize: 14, color: '#666' }}>Загружено {images.length} из {max}</Text>
</View>
      <Text style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>
        Перетягивайте фотографии в нужном порядке
      </Text>

      {/* Image grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  {images.length === 0 ? (
    <TouchableOpacity
      onPress={handlePickImage}
      style={{
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        height: 180,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons name="camera-outline" size={32} color="#888" style={{ marginBottom: 8 }} />
      <Text style={{ fontSize: 16, fontWeight: '500' }}>Добавить фотографии</Text>
      <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
        Форматы JPEG, JPG, PNG, HEIC до 20 МБ каждый
      </Text>
    </TouchableOpacity>
  ) : (
    <>
      {images.map((uri, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => setPreviewIndex(index)}
          style={{
            width: (screenWidth - 48) / 3,
            aspectRatio: 1,
            position: 'relative',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
          <TouchableOpacity
            onPress={() => handleRemove(index)}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 12,
              padding: 2,
            }}
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Add button */}
      {images.length < max && (
        <TouchableOpacity
          onPress={handlePickImage}
          style={{
            width: (screenWidth - 48) / 3,
            aspectRatio: 1,
            backgroundColor: '#f0f0f0',
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="camera-outline" size={24} color="#888" />
          <Text style={{ fontSize: 12, color: '#666' }}>Добавить</Text>
        </TouchableOpacity>
      )}
    </>
  )}
</View>

      {/* Preview Modal */}
      <ImageViewing
  images={images.map((uri) => ({ uri }))}
  imageIndex={previewIndex ?? 0}
  visible={previewIndex !== null}
  onRequestClose={() => setPreviewIndex(null)}
/>
    </View>
  );
}
