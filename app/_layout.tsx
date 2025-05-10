import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <PaperProvider>
    {/* <AuthProvider> */}
  <Stack screenOptions={{ headerShown: false }} />
    {/* </AuthProvider> */}
    </PaperProvider>
  );
}