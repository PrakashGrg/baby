import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://baby-care-8ewi.onrender.com/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach access token to every request automatically
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        const response = await axios.post(`${BASE_URL}/auth/login/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        await SecureStore.setItemAsync('access_token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username: string, password: string, email?: string) =>
    apiClient.post('/auth/register/', { username, password, email: email || '' }),

  login: (username: string, password: string) =>
    apiClient.post('/auth/login/', { username, password }),

  me: () => apiClient.get('/auth/me/'),
};

export const activityAPI = {
  dailySummary: (roomName: string = 'room1') =>
    apiClient.get(`/activity/daily-summary/?room_name=${roomName}`),
  timeline: (roomName: string = 'room1') =>
    apiClient.get(`/activity/timeline/?room_name=${roomName}`),
};

export const sleepAPI = {
  status: (roomName: string = 'room1') =>
    apiClient.get(`/sleep/status/?room_name=${roomName}`),
  history: (roomName: string = 'room1') =>
    apiClient.get(`/sleep/history/?room_name=${roomName}`),
};

export const sensorsAPI = {
  simulate: (roomName: string = 'room1') =>
    apiClient.post('/sensors/simulate/', { room_name: roomName }),
  history: (roomName: string = 'room1') =>
    apiClient.get(`/sensors/history/?room_name=${roomName}`),
};


export const babyAPI = {
  list: () => apiClient.get('/baby/'),
  create: (data: { name: string; birthday?: string; weight_kg?: number; height_cm?: number; sleep_goal_hours?: number }) =>
    apiClient.post('/baby/', data),
  update: (id: number, data: Partial<{ name: string; birthday: string; weight_kg: number; height_cm: number; sleep_goal_hours: number }>) =>
    apiClient.patch(`/baby/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/baby/${id}/`),
  joinByCode: (roomId: string) => apiClient.get(`/baby/join/${roomId}/`),
};

export const pushAPI = {
  registerToken: (token: string) => apiClient.post('/auth/push-token/', { token }),
};