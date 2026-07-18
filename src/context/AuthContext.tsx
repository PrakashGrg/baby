import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../api/client';
import { registerForPushNotifications } from '../utils/notifications';


interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone_number: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const response = await authAPI.me();
        setUser(response.data);
        registerForPushNotifications().catch((error) => {
          console.log('Push registration failed', error);
        });
      }
    } catch (error) {
      // Token invalid/expired — clear it
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    const response = await authAPI.login(username, password);
    await SecureStore.setItemAsync('access_token', response.data.access);
    await SecureStore.setItemAsync('refresh_token', response.data.refresh);

    const meResponse = await authAPI.me();
    setUser(meResponse.data);

    registerForPushNotifications().catch((error) => {
      console.log('Push registration failed', error);
    });
  }

  async function register(username: string, password: string, email?: string) {
    await authAPI.register(username, password, email);
    await login(username, password);
  }

  async function logout() {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}