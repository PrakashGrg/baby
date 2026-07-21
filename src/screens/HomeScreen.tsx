import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { activityAPI, sleepAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

const ROOM_NAME = 'room1';

interface Summary {
  motion_event_count: number;
  cry_event_count: number;
  average_temperature_celsius: number | null;
  average_humidity_percent: number | null;
}

interface TimelineEvent {
  type: string;
  message: string;
  timestamp: string;
  value: number | null;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sleepState, setSleepState] = useState<string>('unknown');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const [summaryRes, sleepRes, timelineRes] = await Promise.all([
        activityAPI.dailySummary(ROOM_NAME),
        sleepAPI.status(ROOM_NAME),
        activityAPI.timeline(ROOM_NAME),
      ]);
      setSummary(summaryRes.data);
      setSleepState(sleepRes.data.state);
      setTimeline(timelineRes.data);
    } catch (error) {
      console.log('Failed to load dashboard data', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const isAsleep = sleepState === 'asleep';
  const lastEvent = timeline[0];

  const hourBuckets = buildHourlyBuckets(timeline);
  const maxBucket = Math.max(...hourBuckets.map((b) => b.count), 1);

  function formatEventTime(timestamp: string) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function eventIcon(type: string) {
    if (type === 'cry') return 'volume-high';
    if (type === 'sleep') return 'moon';
    return 'walk';
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>{t('hello')}, {user?.username}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('babyDoing')}</Text>
        </View>
        <TouchableOpacity style={[styles.avatarCircle, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() ?? '?'}</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient colors={isAsleep ? gradients.night : gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Text style={styles.heroLabel}>{t('babyStatus')}</Text>
          <View style={styles.roomChip}>
            <Ionicons name="location-outline" size={12} color="#fff" />
            <Text style={styles.roomChipText}>{ROOM_NAME}</Text>
          </View>
        </View>
        <View style={styles.heroMain}>
          <Ionicons name={isAsleep ? 'moon' : 'sunny'} size={40} color="#fff" style={styles.heroIcon} />
          <Text style={styles.heroStatus}>{isAsleep ? t('sleeping') : sleepState === 'awake' ? t('awake') : t('unknown')}</Text>
        </View>
        <Text style={styles.heroSub}>{isAsleep ? t('restingPeacefully') : t('activeAlert')}</Text>
      </LinearGradient>

      <View style={styles.quickActions}>
        <QuickAction icon="videocam" label="Live" colors={colors} onPress={() => navigation.navigate('Live')} />
        <QuickAction icon="happy" label="Baby" colors={colors} onPress={() => navigation.navigate('BabyProfile')} />
        <QuickAction icon="bar-chart" label="Insights" colors={colors} onPress={() => navigation.navigate('Insights')} />
        <QuickAction icon="moon" label="Sleep" colors={colors} onPress={() => navigation.navigate('Sleep')} />
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Activity, last 6 hours</Text>
        <View style={styles.chartRow}>
          {hourBuckets.map((bucket, index) => (
            <View key={index} style={styles.chartBarWrap}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${Math.max((bucket.count / maxBucket) * 100, bucket.count > 0 ? 8 : 0)}%`,
                      backgroundColor: bucket.count > 0 ? colors.primary : colors.border,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.chartLabel, { color: colors.textMuted }]}>{bucket.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {lastEvent && (
        <TouchableOpacity
          style={[styles.lastEventCard, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Insights')}
        >
          <LinearGradient
            colors={lastEvent.type === 'cry' ? gradients.coral : lastEvent.type === 'sleep' ? gradients.lavender : gradients.primary}
            style={styles.lastEventIcon}
          >
            <Ionicons name={eventIcon(lastEvent.type) as any} size={18} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.lastEventLabel, { color: colors.textMuted }]}>LATEST EVENT</Text>
            <Text style={[styles.lastEventMessage, { color: colors.text }]}>{lastEvent.message}</Text>
          </View>
          <Text style={[styles.lastEventTime, { color: colors.textMuted }]}>{formatEventTime(lastEvent.timestamp)}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.grid}>
        <StatCard icon="walk-outline" label={t('motionEvents')} value={summary ? summary.motion_event_count.toString() : '-'} gradientColors={gradients.primary} colors={colors} />
        <StatCard icon="volume-high-outline" label={t('cryEvents')} value={summary ? summary.cry_event_count.toString() : '-'} gradientColors={gradients.coral} colors={colors} />
      </View>
    </ScrollView>
  );
}

function buildHourlyBuckets(timeline: TimelineEvent[]) {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const bucketTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourStart = new Date(bucketTime);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    const count = timeline.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return t >= hourStart.getTime() && t < hourEnd.getTime();
    }).length;

    buckets.push({ label: hourStart.getHours().toString().padStart(2, '0'), count });
  }
  return buckets;
}

function QuickAction({ icon, label, colors, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; colors: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickActionItem} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: colors.card }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.textMuted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({ icon, label, value, gradientColors, colors }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; gradientColors: readonly [string, string, ...string[]]; colors: any }) {
  return (
    <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statusIconCircle}>
        <Ionicons name={icon} size={20} color="#fff" />
      </LinearGradient>
      <Text style={[styles.statusValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statusLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: 2 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroCard: { borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.soft },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)', letterSpacing: 1, fontWeight: '600' },
  roomChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.xl, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  roomChipText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  heroMain: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  heroIcon: { marginRight: spacing.sm },
  heroStatus: { ...typography.h1, fontSize: 34, color: '#fff' },
  heroSub: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  quickActionItem: { alignItems: 'center', flex: 1 },
  quickActionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs, ...shadow.card },
  quickActionLabel: { fontSize: 12, fontWeight: '600' },
  chartCard: { borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.card },
  chartTitle: { ...typography.caption, fontWeight: '600', marginBottom: spacing.md },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 70 },
  chartBarWrap: { alignItems: 'center', flex: 1 },
  chartBarTrack: { width: 14, height: 50, justifyContent: 'flex-end' },
  chartBar: { width: 14, borderRadius: 7 },
  chartLabel: { fontSize: 10, marginTop: spacing.xs },
  lastEventCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, ...shadow.card },
  lastEventIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  lastEventLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  lastEventMessage: { ...typography.body, fontWeight: '600', marginTop: 2 },
  lastEventTime: { fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statusCard: { width: '48%', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow.card },
  statusIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statusValue: { ...typography.h2 },
  statusLabel: { ...typography.caption, marginTop: spacing.xs },
});