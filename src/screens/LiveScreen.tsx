import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { connectMonitorSocket } from '../api/websocket';
import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { useLanguage } from '../context/LanguageContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';



interface AlertItem {
  id: string;
  type: string;
  message: string;
  time: string;
  intensity?: string;
  snapshot?: string | null;
}
interface SensorData {
  temperature: number;
  humidity: number;
}

export default function LiveScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { roomId } = useRoom();
  const { t } = useLanguage();
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isBusyRef = useRef(false);
  const recordingStartTimeRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function setup() {
        const socket = await connectMonitorSocket(roomId);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isActive) setConnected(true);
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
          ).start();
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'motion_alert') {
            addAlert('motion', 'Motion detected in the room', data.intensity, data.annotated_frame);
          } else if (data.type === 'cry_alert') {
            addAlert('cry', 'Crying detected', data.intensity);
          } else if (data.type === 'sensor_update') {
            setSensorData({ temperature: data.temperature, humidity: data.humidity });
          } else if (data.type === 'frame_broadcast') {
            setLiveFrame(data.frame);
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
        wsRef.current?.close();
        wsRef.current = null;
        setConnected(false);
        setLiveFrame(null);
      };
    }, [roomId])
  );

  function intensityColor(intensity: string, colors: any) {
    if (intensity === 'high') return colors.danger;
    if (intensity === 'medium') return colors.warning;
    return colors.success;
  }

  function addAlert(type: string, message: string, intensity?: string, snapshot?: string) {
    const newAlert: AlertItem = {
      id: Date.now().toString(),
      type,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      intensity,
      snapshot: snapshot ? `data:image/jpeg;base64,${snapshot}` : null,
    };
    setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
  }

  async function startTalking() {
    if (isBusyRef.current || recordingRef.current) return;
    isBusyRef.current = true;
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        isBusyRef.current = false;
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (error) {
      console.log('Failed to start recording', error);
    } finally {
      isBusyRef.current = false;
    }
  }

  async function stopTalking() {
    const recording = recordingRef.current;
    if (!recording || isBusyRef.current) return;
    recordingRef.current = null;
    isBusyRef.current = true;
    setIsRecording(false);

    const elapsed = Date.now() - recordingStartTimeRef.current;
    if (elapsed < 700) {
      await new Promise((resolve) => setTimeout(resolve, 700 - elapsed));
    }

    setIsSending(true);
    try {
      const status = await recording.getStatusAsync();
      if (!status.canRecord && !status.isRecording) {
        setIsSending(false);
        isBusyRef.current = false;
        return;
      }
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri && wsRef.current?.readyState === WebSocket.OPEN) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          wsRef.current?.send(JSON.stringify({ type: 'parent_voice', audio: base64Audio }));
          setIsSending(false);
        };
        reader.readAsDataURL(blob);
      } else {
        setIsSending(false);
      }
    } catch (error) {
      console.log('Failed to send recording', error);
    } finally {
      setIsSending(false);
      isBusyRef.current = false;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cameraContainer}>
        {liveFrame ? (
          <Image source={{ uri: liveFrame }} style={styles.camera} resizeMode="cover" />
        ) : (
          <View style={[styles.camera, styles.noFeedContainer]}>
            <Ionicons name="videocam-off-outline" size={40} color="rgba(255,255,255,0.4)" />
            <Text style={styles.noFeedText}>
              {connected ? 'Waiting for camera feed...' : 'Connecting...'}
            </Text>
            <Text style={styles.noFeedSubtext}>Open Child Mode on the monitoring device</Text>
          </View>
        )}
        <View style={styles.topOverlay}>
          <View style={styles.statusBadge}>
            <Animated.View style={[styles.statusDot, { backgroundColor: connected ? colors.success : colors.danger, transform: [{ scale: connected ? pulseAnim : 1 }] }]} />
            <Text style={styles.statusText}>{connected ? t('live') : t('connecting')}</Text>
          </View>
          <TouchableOpacity style={styles.roomBadge} onPress={() => navigation.navigate('RoomPicker')}>
            <Text style={styles.roomBadgeText}>{roomId}</Text>
            <Ionicons name="chevron-down" size={12} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        {sensorData && (
          <View style={styles.sensorOverlay} pointerEvents="none">
            <View style={styles.sensorPill}><Text style={styles.sensorText}>{sensorData.temperature}°C</Text></View>
            <View style={styles.sensorPill}><Text style={styles.sensorText}>{sensorData.humidity}% humidity</Text></View>
          </View>
        )}
        <View style={styles.bottomFade} pointerEvents="none" />

        <TouchableOpacity
          style={[styles.talkButton, { backgroundColor: isRecording ? colors.danger : colors.primary }]}
          onPressIn={startTalking}
          onPressOut={stopTalking}
          disabled={isSending}
        >
          <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={24} color="#fff" />
          <Text style={styles.talkButtonText}>
            {isSending ? 'Sending...' : isRecording ? 'Release to Send' : 'Hold to Talk'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alertsSection}>
        <View style={styles.alertsHeader}>
          <Text style={[styles.alertsTitle, { color: colors.text }]}>{t('recentAlerts')}</Text>
          {alerts.length > 0 && <View style={[styles.alertsCountBadge, { backgroundColor: colors.primary }]}><Text style={styles.alertsCountText}>{alerts.length}</Text></View>}
        </View>
        <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyEmoji, { color: colors.textMuted }]}>ZZZ</Text>
              <Text style={[styles.emptyText, { color: colors.text }]}>{t('allQuiet')}</Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>{t('seeAlertsHere')}</Text>
            </View>
          ) : alerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: colors.card }]}>
              {alert.snapshot ? (
                <Image source={{ uri: alert.snapshot }} style={styles.alertThumbnail} />
              ) : (
                <LinearGradient colors={alert.type === 'cry' ? gradients.coral : gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.alertIconCircle}>
                  <Ionicons name={alert.type === 'cry' ? 'volume-high' : 'walk'} size={18} color="#fff" />
                </LinearGradient>
              )}
              <View style={styles.alertContent}>
                <View style={styles.alertMessageRow}>
                  <Text style={[styles.alertMessage, { color: colors.text }]}>{alert.message}</Text>
                  {alert.intensity && alert.intensity !== 'none' && (
                    <View style={[styles.intensityBadge, { backgroundColor: intensityColor(alert.intensity, colors) }]}>
                      <Text style={styles.intensityText}>{alert.intensity}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.alertTime, { color: colors.textMuted }]}>{alert.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: { height: '45%', backgroundColor: '#000', position: 'relative' },
  camera: {
    flex: 1,
  },
  noFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFeedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  noFeedSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  topOverlay: { position: 'absolute', top: spacing.md, left: spacing.md, right: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10, elevation: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  statusText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  roomBadge: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  roomBadgeText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  bottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 9, elevation: 9 },
  sensorOverlay: { position: 'absolute', bottom: spacing.md, left: spacing.md, right: spacing.md, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10, elevation: 10 },
  sensorPill: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2 },
  sensorText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  talkButton: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.xl,
    zIndex: 11,
    elevation: 11,
  },
  talkButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  alertsSection: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  alertsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  alertsTitle: { ...typography.h2 },
  alertsCountBadge: { borderRadius: radius.xl, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.sm, paddingHorizontal: 6 },
  alertsCountText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  alertsList: { flex: 1 },
  emptyState: { alignItems: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.lg },
  emptyEmoji: { fontSize: 13, letterSpacing: 2, marginBottom: spacing.sm },
  emptyText: { ...typography.body, fontWeight: '600', marginBottom: spacing.xs },
  emptySubtext: { ...typography.caption, textAlign: 'center' },
  alertCard: { flexDirection: 'row', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center', ...shadow.card },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertThumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  alertMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityBadge: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  intensityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  alertContent: { flex: 1 },
  alertMessage: { ...typography.body, fontWeight: '500' },
  alertTime: { ...typography.caption, marginTop: 2 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  permissionIconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, ...shadow.card },
  permissionTitle: { ...typography.h2, marginBottom: spacing.sm, textAlign: 'center' },
  permissionText: { ...typography.body, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  permissionButton: { borderRadius: radius.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm + 6 },
  permissionButtonText: { color: '#fff', fontWeight: '600' },
});