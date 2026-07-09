import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { sleepAPI } from '../api/client';
import { colors, radius, spacing, typography } from '../theme';

const ROOM_NAME = 'room1';

interface SleepLogEntry {
  id: number;
  room_name: string;
  state: string;
  changed_at: string;
}

export default function SleepScreen() {
  const [currentState, setCurrentState] = useState<string>('unknown');
  const [history, setHistory] = useState<SleepLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  async function loadData() {
    try {
      const [statusRes, historyRes] = await Promise.all([
        sleepAPI.status(ROOM_NAME),
        sleepAPI.history(ROOM_NAME),
      ]);
      setCurrentState(statusRes.data.state);
      setHistory(historyRes.data);
    } catch (error) {
      console.log('Failed to load sleep data', error);
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

  function computeTodaySleepMinutes(): number {
    const today = new Date().toDateString();
    const todayLogs = history.filter(
      (log) => new Date(log.changed_at).toDateString() === today
    );

    let totalMinutes = 0;
    for (let i = 0; i < todayLogs.length - 1; i++) {
      if (todayLogs[i].state === 'asleep') {
        const start = new Date(todayLogs[i].changed_at).getTime();
        const end = new Date(todayLogs[i + 1].changed_at).getTime();
        totalMinutes += (end - start) / 60000;
      }
    }

    // If the most recent transition today is "asleep" with no wake-up yet,
    // count time from then until now as ongoing sleep
    if (todayLogs.length > 0 && todayLogs[todayLogs.length - 1].state === 'asleep') {
      const lastStart = new Date(todayLogs[todayLogs.length - 1].changed_at).getTime();
      totalMinutes += (Date.now() - lastStart) / 60000;
    }

    return Math.round(totalMinutes);
  }

  const sleepMinutes = computeTodaySleepMinutes();
  const hours = Math.floor(sleepMinutes / 60);
  const minutes = sleepMinutes % 60;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Sleep Tracking</Text>
      <Text style={styles.subtitle}>Room: {ROOM_NAME}</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Current Status</Text>
        <Text style={styles.heroStatus}>
          {currentState === 'asleep' ? 'Sleeping' : currentState === 'awake' ? 'Awake' : 'Unknown'}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Sleep today</Text>
        <Text style={styles.statValue}>
          {hours}h {minutes}m
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Timeline</Text>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No sleep transitions recorded yet today.</Text>
        </View>
      ) : (
        history.map((log) => (
          <View key={log.id} style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: log.state === 'asleep' ? colors.primary : colors.warning },
              ]}
            />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineState}>
                {log.state === 'asleep' ? 'Fell asleep' : 'Woke up'}
              </Text>
              <Text style={styles.timelineTime}>
                {new Date(log.changed_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
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
  title: {
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
    marginBottom: spacing.md,
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
  statCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statValue: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineState: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  timelineTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});