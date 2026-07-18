import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { babyAPI } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

interface Baby {
  id: number;
  name: string;
  birthday: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  sleep_goal_hours: number;
}

export default function BabyProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sleepGoal, setSleepGoal] = useState('12');
  const [saving, setSaving] = useState(false);

  async function loadBabies() {
    try {
      const res = await babyAPI.list();
      setBabies(res.data);
    } catch (error) {
      console.log('Failed to load babies', error);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadBabies();
    }, [])
  );

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for your baby.');
      return;
    }
    const weightKg = weight.trim() ? parseFloat(weight) : undefined;
    const heightCm = height.trim() ? parseFloat(height) : undefined;
    const sleepHours = sleepGoal.trim() ? parseFloat(sleepGoal) : 12;

    setSaving(true);
    try {
      await babyAPI.create({
        name: name.trim(),
        weight_kg: isNaN(weightKg as number) ? undefined : weightKg,
        height_cm: isNaN(heightCm as number) ? undefined : heightCm,
        sleep_goal_hours: isNaN(sleepHours) ? 12 : sleepHours,
      });
      setName('');
      setWeight('');
      setHeight('');
      setSleepGoal('12');
      setShowForm(false);
      loadBabies();
    } catch (error) {
      Alert.alert('Error', 'Could not save baby profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: number) {
    Alert.alert('Delete Profile', 'Are you sure you want to delete this baby profile?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await babyAPI.delete(id);
            loadBabies();
          } catch (error) {
            Alert.alert('Error', 'Could not delete profile.');
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Baby Profile</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Baby's name"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.label, { color: colors.textMuted }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="e.g. 4.2"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.label, { color: colors.textMuted }]}>Height (cm)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="e.g. 52"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.label, { color: colors.textMuted }]}>Sleep Goal (hours/day)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={sleepGoal}
              onChangeText={setSleepGoal}
              keyboardType="numeric"
              placeholder="12"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient colors={gradients.primary} style={styles.saveButton}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
        ) : babies.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Ionicons name="happy-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No baby profiles yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Tap the + button to add one</Text>
          </View>
        ) : (
          babies.map((baby) => (
            <View key={baby.id} style={[styles.babyCard, { backgroundColor: colors.card }]}>
              <LinearGradient colors={gradients.lavender} style={styles.babyAvatar}>
                <Text style={styles.babyAvatarText}>{baby.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View style={styles.babyInfo}>
                <Text style={[styles.babyName, { color: colors.text }]}>{baby.name}</Text>
                <Text style={[styles.babyMeta, { color: colors.textMuted }]}>
                  {baby.weight_kg ? `${baby.weight_kg}kg  ` : ''}
                  {baby.height_cm ? `${baby.height_cm}cm  ` : ''}
                  Sleep goal: {baby.sleep_goal_hours}h
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(baby.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
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
  formCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  label: { ...typography.caption, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    borderWidth: 1,
  },
  saveButton: {
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 6,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: spacing.xxl },
  emptyText: { ...typography.body, fontWeight: '600', marginTop: spacing.md },
  emptySubtext: { ...typography.caption, marginTop: spacing.xs },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  babyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  babyAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  babyInfo: { flex: 1 },
  babyName: { ...typography.body, fontWeight: '600' },
  babyMeta: { ...typography.caption, marginTop: 2 },
});