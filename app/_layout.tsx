import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SelectionProvider } from '@/contexts/SelectionContext';

export default function RootLayout() {
  return (
    
    <SelectionProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>

      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
  
 
    </GestureHandlerRootView>
    </SelectionProvider>
  );
}
