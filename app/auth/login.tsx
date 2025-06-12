import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Ionicons name="calendar-outline" size={28} color="#007AFF" />
          <Text style={styles.logoText}>EventApp</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.tabActive]}>Вход</Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.tab}>Регистрация</Text>
        </TouchableOpacity>
      </View>

      {/* Inputs */}
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={!!errors.email}
          style={styles.input}
          outlineColor="#ccc"
          activeOutlineColor="#007AFF"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          mode="outlined"
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          error={!!errors.password}
          style={styles.input}
          outlineColor="#ccc"
          activeOutlineColor="#007AFF"
          right={
            <TextInput.Icon
              icon={passwordVisible ? 'eye-off' : 'eye'}
              onPress={() => setPasswordVisible(!passwordVisible)}
              forceTextInputFocus={false}
            />
          }
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#007AFF"
        >
          Войти
        </Button>
      </View>
    </View>
    </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    marginRight: 24,
    fontSize: 18,
    color: '#888',
    paddingBottom: 8,
  },
  tabActive: {
    color: '#007AFF',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    fontWeight: 'bold',
  },
  form: {
    marginTop: 32,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
});
