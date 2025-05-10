// import { useEffect, useState } from 'react';
// import { View, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
// import { Text, Card, Button, TextInput } from 'react-native-paper';
// import * as ImagePicker from 'expo-image-picker';
// import { api } from '../../../lib/api';
// import { useAuthContext } from '../../../contexts/AuthContext';
// import { BASE_URL } from '@/lib/config';

// export default function ProfileScreen() {
//   const { user, isAuthenticated, logout, refreshUser } = useAuthContext(); // refreshUser нужен для обновления данных
//   const [editMode, setEditMode] = useState(false);
//   const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
//   const [passwords, setPasswords] = useState({ current: '', new: '' });

//   useEffect(() => {
//     if (user) {
//       setForm({ username: user.username, email: user.email });
//     }
//   }, [user]);

//   if (!isAuthenticated || !user) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <Text>Вы не авторизованы</Text>
//       </View>
//     );
//   }

//   const handleSaveProfile = async () => {
//     try {
//       await api.put('/me', form);
//       await refreshUser(); // Обновляем данные после изменения
//       setEditMode(false);
//       Alert.alert('Успешно', 'Профиль обновлён');
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Ошибка', 'Не удалось сохранить профиль');
//     }
//   };

//   const handleChangePassword = async () => {
//     if (!passwords.current || !passwords.new) {
//       return Alert.alert('Ошибка', 'Введите оба пароля');
//     }
//     try {
//       await api.put('/me/password', {
//         current_password: passwords.current,
//         new_password: passwords.new,
//       });
//       setPasswords({ current: '', new: '' });
//       Alert.alert('Успешно', 'Пароль изменён');
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Ошибка', 'Не удалось сменить пароль');
//     }
//   };

//   const handlePickAvatar = async () => {
//     const res = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       quality: 0.7,
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     });

//     if (!res.canceled) {
//       const uri = res.assets[0].uri;
//       const formData = new FormData();
//       formData.append('avatar', {
//         uri,
//         name: 'avatar.jpg',
//         type: 'image/jpeg',
//       } as any);

//       try {
//         await api.post('/me/avatar', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         await refreshUser();
//         Alert.alert('Успешно', 'Аватар обновлён');
//       } catch (err) {
//         console.error(err);
//         Alert.alert('Ошибка', 'Не удалось загрузить аватар');
//       }
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={{ padding: 16 }}>
//       <Card style={{ padding: 20, borderRadius: 16 }}>
//         <TouchableOpacity onPress={handlePickAvatar} style={{ alignItems: 'center' }}>
//           {user.avatar_url ? (
//             <Image
//               source={{ uri: `${BASE_URL}${user.avatar_url}` }}
//               style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
//             />
//           ) : (
//             <View
//               style={{
//                 width: 80,
//                 height: 80,
//                 borderRadius: 40,
//                 backgroundColor: '#ccc',
//                 marginBottom: 8,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//               }}
//             >
//               <Text style={{ fontSize: 32 }}>{user.username.charAt(0).toUpperCase()}</Text>
//             </View>
//           )}
//           <Text style={{ color: '#888' }}>Изменить аватар</Text>
//         </TouchableOpacity>

//         {editMode ? (
//           <>
//             <TextInput
//               label="Имя пользователя"
//               value={form.username}
//               onChangeText={(text) => setForm({ ...form, username: text })}
//               style={{ marginTop: 16 }}
//             />
//             <TextInput
//               label="Email"
//               value={form.email}
//               onChangeText={(text) => setForm({ ...form, email: text })}
//               style={{ marginTop: 8 }}
//             />
//             <Button mode="contained" onPress={handleSaveProfile} style={{ marginTop: 16 }}>
//               Сохранить
//             </Button>
//           </>
//         ) : (
//           <>
//             <Text variant="titleLarge" style={{ marginTop: 12 }}>
//               {user.username}
//             </Text>
//             <Text style={{ color: '#777' }}>{user.email}</Text>
//             <Text style={{ color: '#999', marginTop: 8 }}>
//               Зарегистрирован: {new Date(user.created_at).toLocaleDateString()}
//             </Text>
//             <Button mode="outlined" onPress={() => setEditMode(true)} style={{ marginTop: 16 }}>
//               Редактировать
//             </Button>
//           </>
//         )}

//         <Text style={{ marginTop: 24, fontWeight: 'bold' }}>Сменить пароль</Text>
//         <TextInput
//           label="Старый пароль"
//           value={passwords.current}
//           onChangeText={(text) => setPasswords({ ...passwords, current: text })}
//           secureTextEntry
//           style={{ marginTop: 8 }}
//         />
//         <TextInput
//           label="Новый пароль"
//           value={passwords.new}
//           onChangeText={(text) => setPasswords({ ...passwords, new: text })}
//           secureTextEntry
//           style={{ marginTop: 8 }}
//         />
//         <Button mode="outlined" onPress={handleChangePassword} style={{ marginTop: 12 }}>
//           Обновить пароль
//         </Button>

//         <Button
//           mode="outlined"
//           onPress={logout}
//           style={{ marginTop: 24, backgroundColor: '#fee' }}
//           textColor="#b00"
//         >
//           Выйти из аккаунта
//         </Button>
//       </Card>
//     </ScrollView>
//   );
// }
