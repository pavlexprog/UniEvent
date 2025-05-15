import { useState } from 'react';
import {Alert, ActivityIndicator } from 'react-native';
import { View } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../lib/api';
import { useAuthContext } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();
  const { login } = useAuthContext();
  
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email обязателен';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Некорректный email';
    if (!password) newErrors.password = 'Пароль обязателен';
    //else if (password.length < 6) newErrors.password = 'Пароль слишком короткий';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleLogin = async () => {
    if (!validate()) return;
  
    setLoading(true);
    try {
      await login(email, password); // ВАЖНО: используем AuthContext
      router.replace('/');
    } catch (err) {
      Alert.alert('Ошибка', 'Неверный email или пароль');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, marginBottom: 16 }}>Вход</Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}

          error={!!errors.email}

          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={!!errors.password}
          style={{ marginBottom: 12 }}
        />

{errors.password && <Text style={{ color: 'red', marginBottom: 16 }}>{errors.password}</Text>}

        <Button mode="contained" onPress={handleLogin}>
          Войти
        </Button>
      </Card>
    </View>
  );
}