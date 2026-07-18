import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, typography, shadow } from '../theme';

const FAQS = [
  {
    q: 'Why does the app show "Connecting..." on the Live screen?',
    a: 'The app is establishing a secure connection to your monitoring device. This usually takes a few seconds. On free server tiers, it may take up to a minute if the server was in idle state.',
  },
  {
    q: 'How does motion and cry detection work?',
    a: 'The camera captures video frames and sends them to our secure server, where advanced computer vision algorithms analyze movement and audio patterns to detect meaningful activity.',
  },
  {
    q: 'What is Child Mode?',
    a: 'Child Mode transforms a secondary device into a dedicated baby monitor camera. You can enable it from Settings > Devices on the device you wish to place near your baby.',
  },
  {
    q: 'Why am I not receiving notifications when the app is closed?',
    a: 'Push notifications require a development build or production version of the app. This is a current limitation when testing with Expo Go.',
  },
  {
    q: 'Is my baby’s data secure?',
    a: 'Yes. We use end-to-end encryption and industry-standard security practices to protect all video feeds and personal data.',
  },
];

export default function HelpScreen({ navigation }: any) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          Find answers to common questions about Baby Care. Need more help? Contact our support team.
        </Text>

        {FAQS.map((item, index) => (
          <View key={index} style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.question, { color: colors.text }]}>{item.q}</Text>
            <Text style={[styles.answer, { color: colors.textMuted }]}>{item.a}</Text>
          </View>
        ))}

        {/* Support Contact Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.text }]}>Still Need Help?</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Our support team is ready to assist you. Reach out to us at{' '}
            <Text style={{ color: colors.primary }}>support@babycare.app</Text>
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
  content: { 
    padding: spacing.lg, 
    paddingTop: 0 
  },
  intro: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  heading: { 
    ...typography.h3, 
    marginBottom: spacing.sm 
  },
  question: { 
    ...typography.body, 
    fontWeight: '600', 
    marginBottom: spacing.xs 
  },
  answer: { 
    ...typography.body, 
    lineHeight: 22 
  },
  paragraph: { 
    ...typography.body, 
    lineHeight: 22 
  },
});