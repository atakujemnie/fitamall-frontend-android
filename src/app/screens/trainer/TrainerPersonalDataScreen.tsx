import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../../../shared/theme';

export const TrainerPersonalDataScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dane osobowe</Text>
      <Text style={styles.description}>
        Tutaj w przyszłości dodamy formularze do edycji danych kontaktowych, danych adresowych i
        widoczności publicznej Twojego profilu.
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
