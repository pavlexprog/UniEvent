// import { useEffect, useState } from 'react';
// import { View, ActivityIndicator } from 'react-native';
// import { useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';

// export default function Index() {
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = await SecureStore.getItemAsync('token');
//       if (token) {
//         router.replace('/(tabs)'); // если есть табы
//       } else {
//         router.replace('/auth/login');
//       }
//       setLoading(false);
//     };

//     checkAuth();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator />
//       </View>
//     );
//   }

//   return null;
// }
