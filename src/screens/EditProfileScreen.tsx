import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../api/client';
import { gradients, radius, spacing, typography, shadow } from '../theme';

export default function EditProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone_number ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!username.trim()) {
      Alert.alert('Missing username', 'Username cannot be empty.');
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setSaving(true);
    try {
      await authAPI.updateMe({ username: username.trim(), email: email.trim(), phone_number: phone.trim() });
      await refreshUser();
      Alert.alert('Saved', 'Your profile has been updated.');
      navigation.goBack();
    } catch (error: any) {
      const data = error?.response?.data;
      const message = data?.username?.[0] || data?.email?.[0] || 'Could not update profile. Please try again.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={gradients.primary} style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{username.charAt(0).toUpperCase() || '?'}</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Username"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.saveButton}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  title: { ...typography.h2 },
  content: { padding: spacing.lg, paddingTop: 0, alignItems: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, ...shadow.soft },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '700' },
  card: { borderRadius: radius.lg, padding: spacing.lg, width: '100%', ...shadow.card },
  label: { ...typography.caption, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 16, borderWidth: 1 },
  saveButton: { borderRadius: radius.sm, paddingVertical: spacing.sm + 6, alignItems: 'center', marginTop: spacing.lg },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});