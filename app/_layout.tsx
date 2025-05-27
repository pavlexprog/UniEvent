import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SelectionProvider } from '@/contexts/SelectionContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritesProvider } from './../contexts/FavoritesContext';
export default function RootLayout() {
  return (
      <AuthProvider>
    <FavoritesProvider>
    <SafeAreaProvider>
    <SelectionProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>

      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
    
      <Stack screenOptions={{ headerShown: false }} />
     
  
 
    </GestureHandlerRootView>
    </SelectionProvider>
    </SafeAreaProvider>
    </FavoritesProvider>
     </AuthProvider>
  );
}
