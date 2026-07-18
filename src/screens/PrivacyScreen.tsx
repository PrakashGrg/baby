import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography, shadow } from '../theme';

export default function PrivacyScreen({ navigation }: any) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Privacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.text }]}>Your data, kept close</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Baby Care stores your account details, baby profiles, and monitoring data (motion,
            cry, sleep, and sensor events) securely in our database, associated only with your
            account.
          </Text>
          <Text style={[styles.heading, { color: colors.text }]}>Camera & microphone</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Video frames and audio are analyzed in real time for motion and cry detection. Raw
            video/audio is not permanently stored — only the resulting event data (timestamps,
            scores) is saved.
          </Text>
          <Text style={[styles.heading, { color: colors.text }]}>Your account</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Your password is never stored in plain text. You can log out of any device at any
            time from the Settings screen.
          </Text>
          <Text style={[styles.heading, { color: colors.text }]}>Third parties</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Baby Care does not sell or share your data with third parties.
          </Text>
        </View>
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
  card: { borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  heading: { ...typography.h3, marginTop: spacing.md, marginBottom: spacing.xs },
  paragraph: { ...typography.body, lineHeight: 22 },
});