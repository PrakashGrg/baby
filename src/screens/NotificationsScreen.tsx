import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography, shadow } from '../theme';

const STORAGE_KEY = 'notification_prefs';

interface Prefs {
  motion: boolean;
  cry: boolean;
  sleep: boolean;
  sensors: boolean;
}

const DEFAULT_PREFS: Prefs = { motion: true, cry: true, sleep: true, sensors: false };

export default function NotificationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setPrefs(JSON.parse(stored));
    });
  }, []);

  function toggle(key: keyof Prefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  const rows: { key: keyof Prefs; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'motion', label: 'Motion Alerts', icon: 'walk-outline' },
    { key: 'cry', label: 'Cry Alerts', icon: 'volume-high-outline' },
    { key: 'sleep', label: 'Sleep State Changes', icon: 'moon-outline' },
    { key: 'sensors', label: 'Temperature/Humidity Warnings', icon: 'thermometer-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ALERT TYPES</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {rows.map((row, index) => (
            <View
              key={row.key}
              style={[styles.row, index < rows.length - 1 && [styles.rowBorder, { borderBottomColor: colors.border }]]}
            >
              <View style={styles.rowLeft}>
                <Ionicons name={row.icon} size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
              </View>
              <Switch
                value={prefs[row.key]}
                onValueChange={() => toggle(row.key)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <Text style={[styles.note, { color: colors.textMuted }]}>
          These preferences control which alerts appear in your Live and Insights feeds.
          Remote push notifications (delivered when the app is closed) require a development
          build and are not available in Expo Go — this is a known Expo SDK 53 platform
          limitation.
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
  sectionLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { ...typography.body },
  note: { ...typography.caption, marginTop: spacing.lg, lineHeight: 18 },
});