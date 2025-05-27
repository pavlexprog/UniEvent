// contexts/FavoritesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Alert } from 'react-native';
import { useAuthContext } from './AuthContext';
type FavoritesContextType = {
  favorites: number[];
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (eventId: number) => Promise<void>;
  isFavorite: (eventId: number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const { isAuthenticated } = useAuthContext()
const fetchFavorites = async () => {
  try {
    const res = await api.get('events/favorites');
    setFavorites(res.data.map((event: any) => event.id));
  } catch (err: any) {
    if (err.response?.status === 401) {
      setFavorites([]); // неавторизован — просто пустой список
    } else {
      console.error('Ошибка при загрузке избранных', err);
    }
  }
};


const toggleFavorite = async (eventId: number) => {
  const isFav = favorites.includes(eventId);
  try {
    if (isFav) {
      await api.post(`/events/${eventId}/unfavorite`);
    } else {
      await api.post(`/events/${eventId}/favorite`);
    }
    await fetchFavorites(); // ✅ чтобы обновить состояние
  } catch (err: any) {
    if (err.response?.status === 401) {
      Alert.alert('Вход', 'Пожалуйста, войдите в аккаунт, чтобы добавлять в избранное.');
    } else {
      console.error('Ошибка при изменении избранного', err);
    }
  }
};

  const isFavorite = (eventId: number) => favorites.includes(eventId);

useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites(); // ✅ только если авторизован
    }
  }, [isAuthenticated]);


  return (
    
    <FavoritesContext.Provider value={{ favorites, fetchFavorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
