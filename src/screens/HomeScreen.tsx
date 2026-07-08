import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { activityAPI, sleepAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';

const ROOM_NAME = 'room1';

interface Summary {
  motion_event_count: number;
  cry_event_count: number;
  average_temperature_celsius: number | null;
  average_humidity_percent: number | null;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sleepState, setSleepState] = useState<string>('unknown');
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const [summaryRes, sleepRes] = await Promise.all([
        activityAPI.dailySummary(ROOM_NAME),
        sleepAPI.status(ROOM_NAME),
      ]);
      setSummary(summaryRes.data);
      setSleepState(sleepRes.data.state);
    } catch (error) {
      console.log('Failed to load dashboard data', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Hello, {user?.username}</Text>
      <Text style={styles.subtitle}>Here's how your baby is doing right now.</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Baby Status</Text>
        <Text style={styles.heroStatus}>
          {sleepState === 'asleep' ? 'Sleeping' : sleepState === 'awake' ? 'Awake' : 'Unknown'}
        </Text>
        <Text style={styles.heroSub}>Room: {ROOM_NAME}</Text>
      </View>

      <View style={styles.grid}>
        <StatusCard
          label="Motion Events"
          value={summary ? summary.motion_event_count.toString() : '-'}
          color={colors.primary}
        />
        <StatusCard
          label="Cry Events"
          value={summary ? summary.cry_event_count.toString() : '-'}
          color={colors.danger}
        />
        <StatusCard
          label="Temperature"
          value={
            summary?.average_temperature_celsius != null
              ? `${summary.average_temperature_celsius} C`
              : '-'
          }
          color={colors.warning}
        />
        <StatusCard
          label="Humidity"
          value={
            summary?.average_humidity_percent != null
              ? `${summary.average_humidity_percent}%`
              : '-'
          }
          color={colors.secondary}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatusCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statusCard}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={styles.statusValue}>{value}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroLabel: {
    ...typography.caption,
    color: '#E0E7FF',
  },
  heroStatus: {
    ...typography.h1,
    color: '#fff',
    marginTop: spacing.xs,
  },
  heroSub: {
    ...typography.caption,
    color: '#E0E7FF',
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: spacing.sm,
  },
  statusValue: {
    ...typography.h2,
    color: colors.text,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
  },
});