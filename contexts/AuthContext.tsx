import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { authStorage } from '../lib/authStorage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  avatarUri: string | null;
  updateAvatarUri: (uri: string) => void;
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const [avatarUriOverride, setAvatarUriOverride] = useState<string | null>(null);
  const avatarUri = avatarUriOverride ?? (user?.avatar_url ? `${user.avatar_url}` : null);
  const updateAvatarUri = (uri: string) => {
    // Добавим ?t=... чтобы сбросить кэш
    setAvatarUriOverride(`${uri}`);
  };


  const refreshUser = async () => {
    const res = await api.get('/me');
    setUser(res.data);
    setAvatarUriOverride(null);
  };

  const init = async () => {
    const token = await authStorage.getToken();
    if (token) {
      //api.defaults.headers.common.Authorization = `Bearer ${token}`;
      try {
        await refreshUser();
      } catch {
        await authStorage.removeToken();
        delete api.defaults.headers.common.Authorization;
      }
    }
    setInitializing(false);
  };

  useEffect(() => {
    init();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = new URLSearchParams();
      data.append('username', email);
      data.append('password', password);

      const res = await api.post('/login', data.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = res.data.access_token;
      await authStorage.saveToken(token);
      //api.defaults.headers.common.Authorization = `Bearer ${token}`;

      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    await api.post('/register', { email, password, name });
    await login(email, password);
  };

  const logout = async () => {
    await authStorage.removeToken();
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, initializing, loading, login, logout, register, refreshUser,  avatarUri, updateAvatarUri,}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
