import * as SecureStore from 'expo-secure-store';

const WS_BASE_URL = 'ws://192.168.18.254:8000';

export async function connectMonitorSocket(roomName: string): Promise<WebSocket> {
  const token = await SecureStore.getItemAsync('access_token');
  const url = `${WS_BASE_URL}/ws/monitor/${roomName}/?token=${token ?? ''}`;
  return new WebSocket(url);
}

type SocketCallback = (ws: WebSocket) => void;

export function createReconnectableSocket(
  roomName: string,
  onSocket: SocketCallback,
  isActive: () => boolean,
  maxRetries = 10
) {
  let retryCount = 0;
  let current: WebSocket | null = null;
  let closedByUs = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  async function connect() {
    if (!isActive() || closedByUs) return;

    try {
      const ws = await connectMonitorSocket(roomName);
      current = ws;

      ws.onopen = () => {
        retryCount = 0;
        if (!isActive() || closedByUs) {
          ws.close();
          return;
        }
        onSocket(ws);
      };

      ws.onclose = () => {
        current = null;
        if (closedByUs || !isActive()) return;

        const delay = Math.min(1000 * Math.pow(1.5, retryCount), 12000);
        retryCount += 1;
        if (retryCount <= maxRetries) {
          retryTimer = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        // onclose follows
      };
    } catch {
      if (!closedByUs && isActive() && retryCount < maxRetries) {
        retryCount += 1;
        retryTimer = setTimeout(connect, 2000);
      }
    }
  }

  connect();

  return {
    getSocket: () => current,
    close: () => {
      closedByUs = true;
      if (retryTimer) clearTimeout(retryTimer);
      current?.close();
      current = null;
    },
  };
}