import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../../../shared/theme';

export const TrainerSettingsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ustawienia trenera</Text>
      <Text style={styles.description}>
        Skonfiguruj preferencje dotyczące powiadomień, kalendarza i prezentacji profilu. W tym
        miejscu dodamy sekcje odpowiedzialne za zarządzanie dostępnością oraz integracje.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 15,
    color: colors.mutedText,
    lineHeight: 21,
  },
});
