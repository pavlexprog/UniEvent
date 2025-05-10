import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'token';

export const authStorage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  saveToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};
