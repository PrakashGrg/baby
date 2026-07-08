import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { connectMonitorSocket } from '../api/websocket';
import { colors, radius, spacing, typography } from '../theme';

const ROOM_NAME = 'room1';
const FRAME_INTERVAL_MS = 1500;

interface AlertItem {
  id: string;
  type: string;
  message: string;
  time: string;
}

export default function LiveScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const cameraRef = useRef<CameraView | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function setup() {
        const socket = await connectMonitorSocket(ROOM_NAME);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isActive) setConnected(true);
          startFrameCapture();
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'motion_alert') {
            addAlert('motion', `Motion detected (score: ${Math.round(data.score)})`);
          } else if (data.type === 'cry_alert') {
            addAlert('cry', `Cry detected (volume: ${Math.round(data.volume)})`);
          }
        };

        socket.onclose = () => {
          if (isActive) setConnected(false);
        };

        socket.onerror = () => {
          if (isActive) setConnected(false);
        };
      }

      setup();

      return () => {
        isActive = false;
        stopFrameCapture();
        wsRef.current?.close();
        wsRef.current = null;
        setConnected(false);
      };
    }, [])
  );

  function addAlert(type: string, message: string) {
    const newAlert: AlertItem = {
      id: Date.now().toString(),
      type,
      message,
      time: new Date().toLocaleTimeString(),
    };
    setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
  }

  function startFrameCapture() {
    intervalRef.current = setInterval(async () => {
      if (!cameraRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.3,
          base64: true,
          skipProcessing: true,
        });

        if (photo?.base64) {
          wsRef.current.send(
            JSON.stringify({ type: 'video_frame', frame: `data:image/jpeg;base64,${photo.base64}` })
          );
        }
      } catch (error) {
        // Frame capture failed silently — skip this cycle
      }
    }, FRAME_INTERVAL_MS);
  }

  function stopFrameCapture() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is needed to monitor your baby.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: connected ? colors.success : colors.danger }]} />
          <Text style={styles.statusText}>{connected ? 'Live' : 'Connecting...'}</Text>
        </View>
      </View>

      <View style={styles.alertsSection}>
        <Text style={styles.alertsTitle}>Recent Alerts</Text>
        <ScrollView style={styles.alertsList}>
          {alerts.length === 0 ? (
            <Text style={styles.emptyText}>No alerts yet — all quiet.</Text>
          ) : (
            alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View
                  style={[
                    styles.alertDot,
                    { backgroundColor: alert.type === 'cry' ? colors.danger : colors.primary },
                  ]}
                />
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraContainer: {
    height: '45%',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  alertsSection: {
    flex: 1,
    padding: spacing.lg,
  },
  alertsTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  alertsList: {
    flex: 1,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    ...typography.body,
    color: colors.text,
  },
  alertTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});