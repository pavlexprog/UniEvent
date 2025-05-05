import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          router.replace('/(tabs)'); // ✅ правильный путь
        } else {
          router.replace('/(auth)/login'); // ✅ правильный путь
        }
      } catch (err) {
        console.error('Ошибка при проверке токена:', err);
        router.replace('/(auth)/login');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
