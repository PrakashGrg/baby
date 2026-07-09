import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';

interface SettingsRow {
  label: string;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  function confirmLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  }

  function comingSoon(label: string) {
    Alert.alert(label, 'This feature is coming soon.');
  }

  const accountRows: SettingsRow[] = [
    { label: 'Baby Profile', onPress: () => comingSoon('Baby Profile') },
    { label: 'Devices', onPress: () => comingSoon('Devices') },
    { label: 'Notifications', onPress: () => comingSoon('Notifications') },
  ];

  const preferenceRows: SettingsRow[] = [
    { label: 'Privacy', onPress: () => comingSoon('Privacy') },
    { label: 'Dark Mode', onPress: () => comingSoon('Dark Mode') },
    { label: 'Language', onPress: () => comingSoon('Language') },
  ];

  const supportRows: SettingsRow[] = [
    { label: 'Help & Support', onPress: () => comingSoon('Help & Support') },
    { label: 'About Baby Care', onPress: () => comingSoon('About Baby Care') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.username}</Text>
          <Text style={styles.profileMeta}>
            {user?.email || 'No email set'}
          </Text>
          <Text style={styles.profileRole}>{user?.role}</Text>
        </View>
      </View>

      <SettingsSection title="Account" rows={accountRows} />
      <SettingsSection title="Preferences" rows={preferenceRows} />
      <SettingsSection title="Support" rows={supportRows} />

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Baby Care v1.0.0</Text>
    </ScrollView>
  );
}

function SettingsSection({ title, rows }: { title: string; rows: SettingsRow[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {rows.map((row, index) => (
          <TouchableOpacity
            key={row.label}
            style={[
              styles.row,
              index < rows.length - 1 && styles.rowBorder,
            ]}
            onPress={row.onPress}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowChevron}>{'>'}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h2,
    color: colors.text,
  },
  profileMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  profileRole: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text,
  },
  rowChevron: {
    color: colors.textMuted,
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});