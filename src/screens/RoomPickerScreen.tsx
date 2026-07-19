import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { babyAPI } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { useRoom } from '../context/RoomContext';
import { gradients, radius, spacing, typography, shadow } from '../theme';

interface Baby {
  id: number;
  name: string;
  room_id: string;
}

export default function RoomPickerScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { roomId, setRoomId } = useRoom();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    babyAPI.list().then((res) => setBabies(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function selectRoom(id: string) {
    setRoomId(id);
    navigation.goBack();
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await babyAPI.joinByCode(joinCode.trim());
      setRoomId(res.data.room_id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Not found', 'No baby profile found with that room code.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Select Room</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>YOUR BABIES</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : babies.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No baby profiles yet. Add one in Settings first, or join a room below using a code someone shared with you.
          </Text>
        ) : (
          babies.map((baby) => (
            <TouchableOpacity
              key={baby.id}
              style={[styles.babyRow, { backgroundColor: colors.card }]}
              onPress={() => selectRoom(baby.room_id)}
            >
              <LinearGradient colors={gradients.lavender} style={styles.babyAvatar}>
                <Text style={styles.babyAvatarText}>{baby.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.babyName, { color: colors.text }]}>{baby.name}</Text>
                <Text style={[styles.babyCode, { color: colors.textMuted }]}>{baby.room_id}</Text>
              </View>
              {roomId === baby.room_id && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          ))
        )}

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: spacing.xl }]}>JOIN BY CODE</Text>
        <View style={[styles.joinCard, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={joinCode}
            onChangeText={setJoinCode}
            placeholder="Enter room code"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleJoin} disabled={joining} activeOpacity={0.85}>
            <LinearGradient colors={gradients.primary} style={styles.joinButton}>
              {joining ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinButtonText}>Join Room</Text>}
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
  content: { padding: spacing.lg, paddingTop: 0 },
  sectionLabel: { ...typography.caption, fontWeight: '600', marginBottom: spacing.sm, marginLeft: spacing.xs },
  emptyText: { ...typography.caption, lineHeight: 18 },
  babyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadow.card },
  babyAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  babyAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  babyName: { ...typography.body, fontWeight: '600' },
  babyCode: { ...typography.caption, marginTop: 2 },
  joinCard: { borderRadius: radius.lg, padding: spacing.lg, ...shadow.card },
  input: { borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: 16, borderWidth: 1, marginBottom: spacing.md },
  joinButton: { borderRadius: radius.sm, paddingVertical: spacing.sm + 6, alignItems: 'center' },
  joinButtonText: { color: '#fff', fontWeight: '600' },
});