import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext'; // убедись, что путь корректен
import { BASE_URL } from '@/lib/config';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthContext();

  const isFormValid =
    email.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  const handleRegister = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
const response = await fetch(`${BASE_URL}/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: email, 
    first_name: firstName,
    last_name: lastName,
    password,
  }),
});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при регистрации');
      }

      // Логиним пользователя автоматически
      await login(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Что-то пошло не так');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Регистрация</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
      />

      <TextInput
        placeholder="Имя"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        placeholder="Фамилия"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        placeholder="Пароль"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        textContentType="password"
        autoComplete="off"
      />

      <View style={styles.hintBox}>
        <Text style={styles.hint}>• минимум 8 символов</Text>
        <Text style={styles.hint}>• большая буква</Text>
        <Text style={styles.hint}>• маленькая буква</Text>
        <Text style={styles.hint}>• цифра</Text>
      </View>

      <TextInput
        placeholder="Повторите пароль"
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        textContentType="password"
        autoComplete="off"
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isFormValid ? '#6fdba7' : '#ccc' },
        ]}
        onPress={handleRegister}
        disabled={!isFormValid || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </Text>
      </TouchableOpacity>

      <Text
        style={styles.link}
        onPress={() => router.replace('/auth/login')}
      >
        Уже есть аккаунт? Войти
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  hintBox: {
    marginBottom: 12,
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: '#888',
  },
  button: {
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#1e88e5',
  },
});
