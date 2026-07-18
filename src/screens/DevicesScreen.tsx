import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

const ROOM_NAME = 'room1';

export default function DevicesScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Devices</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.deviceCard, { backgroundColor: colors.card }]}>
          <LinearGradient colors={gradients.primary} style={styles.deviceIcon}>
            <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceName, { color: colors.text }]}>This Device (Parent Mode)</Text>
            <Text style={[styles.deviceMeta, { color: colors.textMuted }]}>Logged in as {user?.username}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
        </View>

        <View style={[styles.deviceCard, { backgroundColor: colors.card }]}>
          <LinearGradient colors={gradients.lavender} style={styles.deviceIcon}>
            <Ionicons name="videocam-outline" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceName, { color: colors.text }]}>Child Mode Camera</Text>
            <Text style={[styles.deviceMeta, { color: colors.textMuted }]}>Monitoring room: {ROOM_NAME}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ChildMode')}>
            <Text style={[styles.launchLink, { color: colors.primary }]}>Open</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.note, { color: colors.textMuted }]}>
          Baby Care currently uses your phone's own camera as the monitoring device via Child
          Mode. Support for dedicated hardware (ESP32-CAM, IP cameras) is planned for a future
          update.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h2 },
  content: { padding: spacing.lg, paddingTop: 0 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  deviceInfo: { flex: 1 },
  deviceName: { ...typography.body, fontWeight: '600' },
  deviceMeta: { ...typography.caption, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  launchLink: { fontWeight: '600' },
  note: { ...typography.caption, marginTop: spacing.md, lineHeight: 18 },
});