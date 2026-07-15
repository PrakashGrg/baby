import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { connectMonitorSocket } from '../api/websocket';
import { colors, gradients, radius, spacing, typography, shadow } from '../theme';

const ROOM_NAME = 'room1';
const FRAME_INTERVAL_MS = 1500;

interface AlertItem {
  id: string;
  type: string;
  message: string;
  time: string;
}

interface SensorData {
  temperature: number;
  humidity: number;
}

export default function LiveScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function setup() {
        const socket = await connectMonitorSocket(ROOM_NAME);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isActive) setConnected(true);
          startFrameCapture();
          startPulse();
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'motion_alert') {
            addAlert('motion', 'Motion detected in the room');
          } else if (data.type === 'cry_alert') {
            addAlert('cry', 'Crying detected');
          } else if (data.type === 'sensor_update') {
            setSensorData({ temperature: data.temperature, humidity: data.humidity });
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

  function startPulse() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }

  function addAlert(type: string, message: string) {
    const newAlert: AlertItem = {
      id: Date.now().toString(),
      type,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
        // skip this cycle silently
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
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.permissionIconCircle}
        >
          <Ionicons name="videocam" size={30} color="#fff" />
        </LinearGradient>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          Baby Care needs your camera to watch over your baby and detect motion in real time.
        </Text>
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

        <View style={styles.topOverlay} pointerEvents="none">
          <View style={styles.statusBadge}>
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: connected ? colors.success : colors.danger,
                  transform: [{ scale: connected ? pulseAnim : 1 }],
                },
              ]}
            />
            <Text style={styles.statusText}>{connected ? 'Live' : 'Connecting'}</Text>
          </View>
          <View style={styles.roomBadge}>
            <Text style={styles.roomBadgeText}>{ROOM_NAME}</Text>
          </View>
        </View>

        {sensorData && (
          <View style={styles.sensorOverlay} pointerEvents="none">
            <View style={styles.sensorPill}>
              <Text style={styles.sensorText}>{sensorData.temperature}°C</Text>
            </View>
            <View style={styles.sensorPill}>
              <Text style={styles.sensorText}>{sensorData.humidity}% humidity</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomFade} pointerEvents="none" />
      </View>

      <View style={styles.alertsSection}>
        <View style={styles.alertsHeader}>
          <Text style={styles.alertsTitle}>Recent Alerts</Text>
          {alerts.length > 0 && (
            <View style={styles.alertsCountBadge}>
              <Text style={styles.alertsCountText}>{alerts.length}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>ZZZ</Text>
              <Text style={styles.emptyText}>All quiet right now</Text>
              <Text style={styles.emptySubtext}>You'll see motion and cry alerts here as they happen.</Text>
            </View>
          ) : (
            alerts.map((alert) => (
              alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <LinearGradient
                  colors={alert.type === 'cry' ? gradients.coral : gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.alertIconCircle}
                >
                  <Ionicons
                    name={alert.type === 'cry' ? 'volume-high' : 'walk'}
                    size={18}
                    color="#fff"
                  />
                </LinearGradient>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
              </View>
            ))
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
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
    elevation: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  roomBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roomBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 9,
    elevation: 9,
  },
  sensorOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    elevation: 10,
  },
  sensorPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  sensorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertsSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertsTitle: {
    ...typography.h2,
    color: colors.text,
  },
  alertsCountBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: 6,
  },
  alertsCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  alertsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
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
    padding: spacing.xl,
  },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  permissionIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  permissionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 6,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
