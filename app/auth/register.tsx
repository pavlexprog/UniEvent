import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    repeatPassword?: string;
  }>({});

  const router = useRouter();
  const { register } = useAuthContext();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!firstName) newErrors.firstName = 'Имя обязательно';
    if (!lastName) newErrors.lastName = 'Фамилия обязательна';

    if (!email) newErrors.email = 'Email обязателен';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Некорректный email';

    if (!password) newErrors.password = 'Пароль обязателен';
    else if (password.length < 6) newErrors.password = 'Минимум 6 символов';

    if (repeatPassword !== password) newErrors.repeatPassword = 'Пароли не совпадают';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

setLoading(true);
  try {
    const response = await api.post('/register', {
      username: email,
      first_name: firstName,
      last_name: lastName,
      password,
    });

    // если регистрируем и сразу логиним — можно сразу вызвать login(email, password)
    // или перекинуть на экран входа
    router.replace('/');
  } catch (error) {
    console.error(error);
    Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
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
        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.tab}>Вход</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.tabActive]}>Регистрация</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Имя"
          value={firstName}
          onChangeText={setFirstName}
          error={!!errors.firstName}
          style={styles.input}
          outlineColor="#ccc"
          activeOutlineColor="#007AFF"
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        <TextInput
          mode="outlined"
          label="Фамилия"
          value={lastName}
          onChangeText={setLastName}
          error={!!errors.lastName}
          style={styles.input}
          outlineColor="#ccc"
          activeOutlineColor="#007AFF"
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

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

        <TextInput
          mode="outlined"
          label="Повторите пароль"
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          secureTextEntry={!passwordVisible}
          error={!!errors.repeatPassword}
          style={styles.input}
          outlineColor="#ccc"
          activeOutlineColor="#007AFF"
        />
        {errors.repeatPassword && <Text style={styles.errorText}>{errors.repeatPassword}</Text>}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#007AFF"
        >
          Зарегистрироваться
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
