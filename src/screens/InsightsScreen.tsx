import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { activityAPI } from '../api/client';
import { colors, gradients, radius, spacing, typography, shadow } from '../theme';

const ROOM_NAME = 'room1';

interface TimelineEvent {
  type: string;
  message: string;
  timestamp: string;
  value: number | null;
}

export default function InsightsScreen() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const response = await activityAPI.timeline(ROOM_NAME);
      setEvents(response.data);
    } catch (error) {
      console.log('Failed to load timeline', error);
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

  function getEventStyle(type: string, message: string) {
    switch (type) {
      case 'cry':
        return { gradient: gradients.coral, icon: 'volume-high' as const };
      case 'sleep':
        return {
          gradient: gradients.lavender,
          icon: (message.includes('asleep') ? 'moon' : 'sunny') as const,
        };
      default:
        return { gradient: gradients.primary, icon: 'walk' as const };
    }
  }

  function formatDate(timestamp: string) {
    const date = new Date(timestamp);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const dateStr = date.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (dateStr === today) return `Today, ${time}`;
    if (dateStr === yesterday) return `Yesterday, ${time}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>A timeline of everything happening with your baby.</Text>

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events recorded yet.</Text>
        </View>
      ) : (
        events.map((event, index) => {
          const style = getEventStyle(event.type, event.message);
          return (
            <View key={index} style={styles.eventCard}>
              <LinearGradient
                colors={style.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
              >
                <Ionicons name={style.icon} size={18} color="#fff" />
              </LinearGradient>
              <View style={styles.eventContent}>
                <Text style={styles.eventMessage}>{event.message}</Text>
                <Text style={styles.eventTime}>{formatDate(event.timestamp)}</Text>
              </View>
            </View>
          );
        })
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    ...shadow.card,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventContent: {
    flex: 1,
  },
  eventMessage: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  eventTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});