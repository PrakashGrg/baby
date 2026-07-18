import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

export default function AboutScreen({ navigation }: any) {
  const { colors } = useTheme();

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo & Branding */}
        <LinearGradient colors={gradients.hero} style={styles.logoBadge}>
          <Ionicons name="heart" size={32} color="#fff" />
        </LinearGradient>

        <Text style={[styles.appName, { color: colors.text }]}>Baby Care</Text>
        <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0</Text>

        {/* Mission */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            We created Baby Care because we know how precious those early days are — and how much 
            you want to be there for every little moment. Our app helps you stay close to your baby 
            with smart monitoring, real-time alerts, and peaceful sleep tracking, so you can rest 
            easier knowing they're safe.
          </Text>
        </View>

        {/* Technology */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.text }]}>How It Works</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            Baby Care combines smart technology with caring design. Using reliable tools like 
            Django, OpenCV, and React Native, we built a system that delivers clear video, 
            accurate cry detection, and instant notifications — all while keeping your data safe.
          </Text>
        </View>

        {/* Key Features */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.text }]}>What You’ll Love</Text>
          <Text style={[styles.paragraph, { color: colors.textMuted }]}>
            • Crystal clear live video{'\n'}
            • Smart cry and motion alerts{'\n'}
            • Gentle sleep tracking{'\n'}
            • Room temperature & air quality monitoring{'\n'}
            • Fast notifications when it matters most{'\n'}
            • Strong privacy and security
          </Text>
        </View>

        {/* Legal */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.text }]}>Legal</Text>
          <TouchableOpacity onPress={() => handleLink('https://yourwebsite.com/privacy')}>
            <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLink('https://yourwebsite.com/terms')}>
            <Text style={[styles.link, { color: colors.primary }]}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          © 2026 Baby Care{'\n'}
          Made with love for new parents ❤️
        </Text>
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
    paddingTop: 0,
    alignItems: 'center',
    },
    logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.soft,
    },
    appName: { ...typography.h1 },
    version: {
    ...typography.caption,
    marginBottom: spacing.xl,
    },
    card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    width: '100%',
    ...shadow.card,
    },
    heading: {
    ...typography.h3,
    marginBottom: spacing.sm,
    },
    paragraph: {
    ...typography.body,
    lineHeight: 24,
    },
    link: {
    ...typography.body,
    marginVertical: spacing.xs,
    textDecorationLine: 'underline',
    },
    footer: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
   },
});