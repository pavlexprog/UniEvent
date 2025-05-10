// components/Protected.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export const Protected = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAuthenticated } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  return <>{children}</>;
};
