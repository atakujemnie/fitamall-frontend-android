import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../shared/theme';
import { getTrainerStats } from '../../shared/api/trainers.api';
import { mapApiError } from '../../shared/utils/apiErrors';
import { AuthStackParamList } from '../navigation/AuthNavigator';

export const PublicHomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [totalPublicTrainers, setTotalPublicTrainers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getTrainerStats();
      setTotalPublicTrainers(data.total_public_trainers);
    } catch (err) {
      const mapped = mapApiError(err, {
        fallbackMessage: 'Nie udało się pobrać statystyk. Spróbuj ponownie.',
      });

      setError(mapped.message ?? 'Nie udało się pobrać statystyk. Spróbuj ponownie.');
      setTotalPublicTrainers(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>Fitamall</Text>
          <Text style={styles.subtitle}>
            Twoje miejsce do odkrywania trenerów personalnych i rozpoczęcia zdrowej rutyny.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Społeczność trenerów</Text>

          {loading ? (
            <View style={styles.centerRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.metaText}>Ładowanie statystyk...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={fetchStats}>
                <Text style={styles.retryText}>Spróbuj ponownie</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.highlightText}>
              Znajdź swojego trenera spośród {totalPublicTrainers ?? 0} zarejestrowanych trenerów.
            </Text>
          )}
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Dołącz teraz</Text>
          <Text style={styles.metaText}>Zaloguj się, aby kontynuować, lub utwórz nowe konto.</Text>
          <View style={styles.actionsRow}>
            <Pressable style={[styles.ctaButton, styles.primaryButton]} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.ctaText}>Zaloguj</Text>
            </Pressable>
            <Pressable
              style={[styles.ctaButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('RegisterClient')}
            >
              <Text style={styles.secondaryText}>Rejestracja</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  highlightText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#331515',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  errorText: {
    color: colors.text,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.text,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ctaButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ctaText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
