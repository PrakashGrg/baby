import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  async function handleRegister() {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(username, password, email);
    } catch (error: any) {
      const data = error?.response?.data;
      const message =
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        'Registration failed. Please check your details and try again.';
      Alert.alert('Registration failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <LinearGradient colors={gradients.hero} style={styles.logoBadge}>
          <Ionicons name="person-add" size={26} color="#fff" />
        </LinearGradient>
        <Text style={[styles.logo, { color: colors.primary }]}>Baby Care</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Create an account to start monitoring your baby.</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Choose a username"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Email (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
          <View style={[styles.passwordRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Create a password"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Confirm Password</Text>
          <View style={[styles.passwordRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
              <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.button}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: colors.textMuted }]}>
            Already have an account? <Text style={[styles.linkBold, { color: colors.primary }]}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  logo: { ...typography.h1, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, textAlign: 'center', marginBottom: spacing.xl },
  card: { borderRadius: radius.lg, padding: spacing.lg, ...shadow.soft },
  label: { ...typography.caption, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
  },
  eyeButton: { paddingHorizontal: spacing.md },
  button: {
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 6,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', marginTop: spacing.lg },
  linkBold: { fontWeight: '600' },
});