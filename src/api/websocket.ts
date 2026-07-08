import * as SecureStore from 'expo-secure-store';

const WS_BASE_URL = 'ws://192.168.18.254:8000';

export async function connectMonitorSocket(roomName: string): Promise<WebSocket> {
  const token = await SecureStore.getItemAsync('access_token');
  const url = `${WS_BASE_URL}/ws/monitor/${roomName}/?token=${token}`;
  return new WebSocket(url);
}