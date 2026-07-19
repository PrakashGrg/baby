import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { connectMonitorSocket } from '../api/websocket';
import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { useLanguage } from '../context/LanguageContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

const FRAME_INTERVAL_MS = 1500;

interface AlertItem { id: string; type: string; message: string; time: string; }
interface SensorData { temperature: number; humidity: number; }

export default function LiveScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { roomId } = useRoom();
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function setup() {
        const socket = await connectMonitorSocket(roomId);
        wsRef.current = socket;
        socket.onopen = () => { if (isActive) setConnected(true); startFrameCapture(); };
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'motion_alert') addAlert('motion', 'Motion detected in the room');
          else if (data.type === 'cry_alert') addAlert('cry', 'Crying detected');
          else if (data.type === 'sensor_update') setSensorData({ temperature: data.temperature, humidity: data.humidity });
        };
        socket.onclose = () => { if (isActive) setConnected(false); };
        socket.onerror = () => { if (isActive) setConnected(false); };
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
    const newAlert: AlertItem = { id: Date.now().toString(), type, message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
  }

  function startFrameCapture() {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();

    intervalRef.current = setInterval(async () => {
      if (!cameraRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return;
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.3, base64: true, skipProcessing: true });
        if (photo?.base64) wsRef.current.send(JSON.stringify({ type: 'video_frame', frame: `data:image/jpeg;base64,${photo.base64}` }));
      } catch (error) {}
    }, FRAME_INTERVAL_MS);
  }

  function stopFrameCapture() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  async function startTalking() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.log('Failed to start recording', error);
    }
  }

  async function stopTalking() {
    if (!recordingRef.current) return;
    setIsRecording(false);
    setIsSending(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

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
      setIsSending(false);
    }
  }

  if (!permission) return <View style={[styles.container, { backgroundColor: colors.background }]} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <LinearGradient colors={gradients.primary} style={styles.permissionIconCircle}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
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
              <LinearGradient colors={alert.type === 'cry' ? gradients.coral : gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.alertIconCircle}>
                <Ionicons name={alert.type === 'cry' ? 'volume-high' : 'walk'} size={18} color="#fff" />
              </LinearGradient>
              <View style={styles.alertContent}>
                <Text style={[styles.alertMessage, { color: colors.text }]}>{alert.message}</Text>
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
  camera: { flex: 1 },
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
  alertIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
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