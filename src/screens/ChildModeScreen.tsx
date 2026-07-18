import React, { useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { connectMonitorSocket } from '../api/websocket';
import { useTheme } from '../context/ThemeContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

const ROOM_NAME = 'room1';
const FRAME_INTERVAL_MS = 1500;

export default function ChildModeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [connected, setConnected] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
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
          startStreaming();
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.15, duration: 1500, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
          ).start();
        };
        socket.onclose = () => { if (isActive) setConnected(false); };
        socket.onerror = () => { if (isActive) setConnected(false); };
      }

      setup();

      return () => {
        isActive = false;
        if (intervalRef.current) clearInterval(intervalRef.current);
        wsRef.current?.close();
        wsRef.current = null;
        setConnected(false);
      };
    }, [])
  );

  function startStreaming() {
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

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <LinearGradient colors={gradients.hero} style={styles.permissionIcon}>
          <Ionicons name="videocam" size={30} color="#fff" />
        </LinearGradient>
        <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Access Needed</Text>
        <Text style={[styles.permissionText, { color: colors.textMuted }]}>
          Child Mode needs the camera and microphone to watch over your baby.
        </Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      <TouchableOpacity style={styles.exitButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.flipButton}
        onPress={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
      >
        <Ionicons name="camera-reverse-outline" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="heart" size={28} color="#fff" />
        </Animated.View>
        <Text style={styles.watchingText}>
          {connected ? 'Watching over your baby' : 'Connecting...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  exitButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  flipButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pulseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(91,141,239,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  watchingText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  permissionTitle: { ...typography.h2, marginBottom: spacing.sm, textAlign: 'center' },
  permissionText: { ...typography.body, textAlign: 'center', marginBottom: spacing.xl },
  permissionButton: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 6,
  },
  permissionButtonText: { color: '#fff', fontWeight: '600' },
});