import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
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

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>{t('hello')}, {user?.username}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('babyDoing')}</Text>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() ?? '?'}</Text>
        </View>
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

      <View style={styles.grid}>
        <StatCard icon="walk-outline" label={t('motionEvents')} value={summary ? summary.motion_event_count.toString() : '-'} gradientColors={gradients.primary} colors={colors} />
        <StatCard icon="volume-high-outline" label={t('cryEvents')} value={summary ? summary.cry_event_count.toString() : '-'} gradientColors={gradients.coral} colors={colors} />
        <StatCard icon="thermometer-outline" label={t('temperature')} value={summary?.average_temperature_celsius != null ? `${summary.average_temperature_celsius}°C` : '-'} gradientColors={gradients.sunrise} colors={colors} />
        <StatCard icon="water-outline" label={t('humidity')} value={summary?.average_humidity_percent != null ? `${summary.average_humidity_percent}%` : '-'} gradientColors={gradients.mint} colors={colors} />
      </View>
    </ScrollView>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statusCard: { width: '48%', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadow.card },
  statusIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  statusValue: { ...typography.h2 },
  statusLabel: { ...typography.caption, marginTop: spacing.xs },
});