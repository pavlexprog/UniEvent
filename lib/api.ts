// lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.0.105:8000'; //
//172.29.80.1
export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  console.log('token in request:', token); 
  if (token) {
    
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

