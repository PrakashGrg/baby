import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { radius, spacing, typography, shadow } from '../theme';

export default function LanguageScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const options: { code: 'en' | 'ne'; label: string }[] = [
    { code: 'en', label: t('english') },
    { code: 'ne', label: t('nepali') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('chooseLanguage')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {options.map((opt, index) => (
            <TouchableOpacity
              key={opt.code}
              style={[styles.row, index < options.length - 1 && [styles.rowBorder, { borderBottomColor: colors.border }]]}
              onPress={() => setLanguage(opt.code)}
            >
              <Text style={[styles.rowLabel, { color: colors.text }]}>{opt.label}</Text>
              {language === opt.code && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  title: { ...typography.h2 },
  content: { padding: spacing.lg },
  card: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowBorder: { borderBottomWidth: 1 },
  rowLabel: { ...typography.body },
});