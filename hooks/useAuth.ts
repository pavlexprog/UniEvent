// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';
import { router } from 'expo-router';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка токена и профиля
  useEffect(() => {
    const init = async () => {
      const token = await SecureStore.getItemAsync('token');

      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        try {
          const res = await api.get('/users/me');
          setUser(res.data);
        } catch (err) {
          console.warn('Не удалось загрузить профиль', err);
          await logout(); // Неверный токен — выходим
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.access_token;

    await SecureStore.setItemAsync('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const profile = await api.get('/users/me');
    setUser(profile.data);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    router.replace('../auth/login'); // или любой путь выхода
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };
}
