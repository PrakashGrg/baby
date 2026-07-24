import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { sleepAPI } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

const ROOM_NAME = 'room1';

interface SleepLogEntry { id: number; room_name: string; state: string; changed_at: string; }

export default function SleepScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [currentState, setCurrentState] = useState<string>('unknown');
  const [history, setHistory] = useState<SleepLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const [statusRes, historyRes] = await Promise.all([sleepAPI.status(ROOM_NAME), sleepAPI.history(ROOM_NAME)]);
      setCurrentState(statusRes.data.state);
      setHistory(historyRes.data);
    } catch (error) {
      console.log('Failed to load sleep data', error);
    }
  }

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function computeTodaySleepMinutes(): number {
    const today = new Date().toDateString();
    const todayLogs = history.filter((log) => new Date(log.changed_at).toDateString() === today);
    let totalMinutes = 0;
    for (let i = 0; i < todayLogs.length - 1; i++) {
      if (todayLogs[i].state === 'asleep') {
        const start = new Date(todayLogs[i].changed_at).getTime();
        const end = new Date(todayLogs[i + 1].changed_at).getTime();
        totalMinutes += (end - start) / 60000;
      }
    }
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('sleepTracking')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Room: {ROOM_NAME}</Text>

      <LinearGradient colors={currentState === 'asleep' ? gradients.night : gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
        <Ionicons name={currentState === 'asleep' ? 'moon' : 'sunny'} size={32} color="#fff" style={{ marginBottom: spacing.xs }} />
        <Text style={styles.heroLabel}>{t('currentStatus')}</Text>
        <Text style={styles.heroStatus}>{currentState === 'asleep' ? t('sleeping') : currentState === 'awake' ? t('awake') : t('unknown')}</Text>
      </LinearGradient>

      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <View style={styles.statCardRow}>
          <LinearGradient colors={gradients.lavender} style={styles.statIconCircle}>
            <Ionicons name="time-outline" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('sleepToday')}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{hours}h {minutes}m</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('timeline')}</Text>

      {history.length === 0 ? (
        <View style={styles.emptyState}><Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('noSleepData')}</Text></View>
      ) : history.map((log) => (
        <View key={log.id} style={[styles.timelineItem, { backgroundColor: colors.card }]}>
          <LinearGradient colors={log.state === 'asleep' ? gradients.primary : gradients.sunrise} style={styles.timelineIconCircle}>
            <Ionicons name={log.state === 'asleep' ? 'moon' : 'sunny'} size={16} color="#fff" />
          </LinearGradient>
          <View style={styles.timelineContent}>
            <Text style={[styles.timelineState, { color: colors.text }]}>{log.state === 'asleep' ? t('fellAsleep') : t('wokeUp')}</Text>
            <Text style={[styles.timelineTime, { color: colors.textMuted }]}>{new Date(log.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: {
    ...typography.h1,
  },
  subtitle: { ...typography.body, marginTop: spacing.xs, marginBottom: spacing.lg },
  heroCard: { borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.md, ...shadow.soft },
  heroLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  heroStatus: { ...typography.h1, color: '#fff', marginTop: spacing.xs },
  statCard: { borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.card },
  statCardRow: { flexDirection: 'row', alignItems: 'center' },
  statIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  statLabel: { ...typography.caption },
  statValue: { ...typography.h1, marginTop: spacing.xs },
  sectionTitle: { ...typography.h2, marginBottom: spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { ...typography.body },
  timelineItem: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  timelineIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  timelineContent: { flex: 1 },
  timelineState: { ...typography.body, fontWeight: '600' },
  timelineTime: { ...typography.caption, marginTop: 2 },
});