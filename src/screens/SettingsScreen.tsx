import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as staticColors, gradients, radius, spacing, typography, shadow } from '../theme';

interface SettingsRow {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  isToggle?: boolean;
  value?: boolean;
}

export default function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();
  const { t } = useLanguage();

  function confirmLogout() {
    Alert.alert(t('logOut'), t('logOutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logOut'), style: 'destructive', onPress: logout },
    ]);
  }

  function comingSoon(label: string) {
    Alert.alert(label, t('comingSoon'));
  }

  const accountRows: SettingsRow[] = [
    { label: t('babyProfile'), icon: 'happy-outline', onPress: () => navigation.navigate('BabyProfile') },
    { label: t('devices'), icon: 'hardware-chip-outline', onPress: () => navigation.navigate('Devices') },
    { label: t('notifications'), icon: 'notifications-outline', onPress: () => navigation.navigate('Notifications') },
    { label: t('childDeviceMode'), icon: 'videocam-outline', onPress: () => navigation.navigate('ChildMode') },
  ];

  const preferenceRows: SettingsRow[] = [
    { label: t('privacy'), icon: 'lock-closed-outline', onPress: () => navigation.navigate('Privacy') },
    { label: t('darkMode'), icon: 'moon-outline', onPress: toggleTheme, isToggle: true, value: mode === 'dark' },
    { label: t('language'), icon: 'language-outline', onPress: () => navigation.navigate('Language') },
  ];

  const supportRows: SettingsRow[] = [
    { label: t('helpSupport'), icon: 'help-circle-outline', onPress: () => navigation.navigate('Help') },
    { label: t('aboutBabyCare'), icon: 'information-circle-outline', onPress: () => navigation.navigate('About') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>

      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <LinearGradient colors={gradients.primary} style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() ?? '?'}</Text>
        </LinearGradient>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.username}</Text>
          <Text style={[styles.profileMeta, { color: colors.textMuted }]}>{user?.email || 'No email set'}</Text>
          <Text style={[styles.profileRole, { color: colors.primary }]}>{user?.role === 'parent' ? t('parent') : user?.role}</Text>
        </View>
      </View>

      <SettingsSection title={t('account')} rows={accountRows} colors={colors} />
      <SettingsSection title={t('preferences')} rows={preferenceRows} colors={colors} />
      <SettingsSection title={t('support')} rows={supportRows} colors={colors} />

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.danger }]} onPress={confirmLogout}>
        <Text style={[styles.logoutText, { color: colors.danger }]}>{t('logOut')}</Text>
      </TouchableOpacity>

      <Text style={[styles.versionText, { color: colors.textMuted }]}>Baby Care v1.0.0</Text>
    </ScrollView>
  );
}

function SettingsSection({ title, rows, colors }: { title: string; rows: SettingsRow[]; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
        {rows.map((row, index) => (
          <TouchableOpacity
            key={row.label}
            style={[styles.row, index < rows.length - 1 && [styles.rowBorder, { borderBottomColor: colors.border }]]}
            onPress={row.isToggle ? undefined : row.onPress}
            disabled={row.isToggle}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={row.icon} size={20} color={colors.primary} style={styles.rowIcon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
            </View>
            {row.isToggle ? (
              <Switch value={row.value} onValueChange={row.onPress} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  title: { ...typography.h1, marginBottom: spacing.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadow.card },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { ...typography.h2 },
  profileMeta: { ...typography.caption, marginTop: 2 },
  profileRole: { ...typography.caption, fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.caption, fontWeight: '600', marginBottom: spacing.sm, marginLeft: spacing.xs, textTransform: 'uppercase' },
  sectionCard: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowBorder: { borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: spacing.sm },
  rowLabel: { ...typography.body },
  logoutButton: { borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg, borderWidth: 1 },
  logoutText: { fontWeight: '600', fontSize: 16 },
  versionText: { ...typography.caption, textAlign: 'center' },
});