import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../../../shared/theme';

export const TrainerProfessionalProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil zawodowy</Text>
      <Text style={styles.description}>
        Sekcja do konfiguracji Twoich specjalizacji, doświadczenia, certyfikatów oraz dostępnych
        usług. Dodaj tutaj więcej szczegółów, aby klienci mogli lepiej poznać Twoją ofertę.
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
