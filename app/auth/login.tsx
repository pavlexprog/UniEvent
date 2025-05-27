import { useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
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
          autoCapitalize="none"
          keyboardType="email-address"
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

        {errors.email && (
          <Text style={{ color: 'red', marginBottom: 4 }}>{errors.email}</Text>
        )}
        {errors.password && (
          <Text style={{ color: 'red', marginBottom: 16 }}>{errors.password}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        >
          Войти
        </Button>

        <Text
          style={{ marginTop: 16, textAlign: 'center', color: '#1e88e5' }}
          onPress={() => router.replace('/auth/register')}
        >
          Нет аккаунта? Зарегистрироваться
        </Text>
      </Card>
    </View>
  );
}
