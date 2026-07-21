import React, { useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { connectMonitorSocket } from '../api/websocket';
import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { useLanguage } from '../context/LanguageContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

const FRAME_INTERVAL_MS = 2000;

export default function ChildModeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { roomId } = useRoom();
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [connected, setConnected] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function setup() {
        const socket = await connectMonitorSocket(roomId);
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
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'parent_voice' && data.audio) {
            playParentVoice(data.audio);
          }
          // frame_broadcast messages are ignored here — Child Mode is the sender, not a viewer
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
          quality: 0.2,
          base64: true,
          skipProcessing: true,
          imageType: 'jpg',
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

  async function playParentVoice(base64Audio: string) {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const uri = FileSystem.cacheDirectory + `voice_${Date.now()}.m4a`;
      await FileSystem.writeAsStringAsync(uri, base64Audio, { encoding: FileSystem.EncodingType.Base64 });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.log('Failed to play parent voice', error);
    }
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <LinearGradient colors={gradients.hero} style={styles.permissionIcon}>
          <Ionicons name="videocam" size={30} color="#fff" />
        </LinearGradient>
        <Text style={[styles.permissionTitle, { color: colors.text }]}>{t('cameraAccessNeeded')}</Text>
        <Text style={[styles.permissionText, { color: colors.textMuted }]}>{t('cameraAccessMsg')}</Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{t('grantAccess')}</Text>
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

      <TouchableOpacity style={styles.roomBadgeChild} onPress={() => navigation.navigate('RoomPicker')}>
        <Text style={styles.roomBadgeChildText}>{roomId}</Text>
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
          {isPlaying ? 'Parent is speaking...' : connected ? 'Watching over your baby' : t('connecting')}
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
  roomBadgeChild: {
    position: 'absolute',
    top: spacing.xl,
    left: '50%',
    marginLeft: -40,
    width: 80,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    zIndex: 10,
  },
  roomBadgeChildText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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