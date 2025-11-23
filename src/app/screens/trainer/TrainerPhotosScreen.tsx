import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../../../shared/theme';

export const TrainerPhotosScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Zdjęcia</Text>
      <Text style={styles.description}>
        Dodaj lub zaktualizuj zdjęcia, które najlepiej pokazują Twój styl pracy i efekty klientów.
        W kolejnych iteracjach pojawi się tu galeria oraz możliwość zarządzania albumami.
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
