import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Missing info', 'Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      Alert.alert('Login failed', 'Please check your username and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <LinearGradient colors={gradients.hero} style={styles.logoBadge}>
          <Ionicons name="heart" size={28} color="#fff" />
        </LinearGradient>
        <Text style={[styles.logo, { color: colors.primary }]}>Baby Care</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('welcomeBack')}</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('username')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={username} onChangeText={setUsername} autoCapitalize="none"
            placeholder="Enter your username" placeholderTextColor={colors.textMuted}
          />
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('password')}</Text>
          <View style={[styles.passwordRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
              placeholder="Enter your password" placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.button}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('logIn')}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.link, { color: colors.textMuted }]}>
            {t('noAccount')} <Text style={[styles.linkBold, { color: colors.primary }]}>{t('signUp')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  logoBadge: { width: 64, height: 64, borderRadius: 32, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  logo: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, textAlign: 'center', marginBottom: spacing.xl },
  card: { borderRadius: radius.lg, padding: spacing.lg, ...shadow.soft },
  label: { ...typography.caption, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 16, borderWidth: 1 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.sm, borderWidth: 1 },
  passwordInput: { flex: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 16 },
  eyeButton: { paddingHorizontal: spacing.md },
  button: { borderRadius: radius.sm, paddingVertical: spacing.sm + 6, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', marginTop: spacing.lg },
  linkBold: { fontWeight: '600' },
});