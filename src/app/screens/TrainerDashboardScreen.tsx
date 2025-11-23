import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTrainerDashboard } from '../../shared/api/trainer.api';
import { mapApiError } from '../../shared/utils/apiErrors';
import { colors, spacing } from '../../shared/theme';
import { TrainerStackParamList } from '../navigation/AppNavigator';

type TrainerDashboardNavigationProp = NativeStackNavigationProp<
  TrainerStackParamList,
  'TrainerDashboard'
>;

type DashboardResponse = {
  name?: string;
  status?: string | { is_public_trainer?: boolean };
  visibility_status?: string;
  is_public?: boolean;
  profile_completion?: number;
  profileCompletion?: number;
  completion?: number;
  missing_items?: string[];
  missingItems?: string[];
  missing_fields?: { personal_data?: string[]; profile?: string[] } | string[];
  personal_data?: { first_name?: string };
};

const dashboardTiles: Array<{
  title: string;
  description: string;
  route: keyof TrainerStackParamList;
}> = [
  {
    title: 'Dane osobowe',
    description: 'Zarządzaj danymi kontaktowymi i informacjami o sobie.',
    route: 'TrainerPersonalData',
  },
  {
    title: 'Profil zawodowy',
    description: 'Zaktualizuj doświadczenie, specjalizacje i ofertę.',
    route: 'TrainerProfessionalProfile',
  },
  {
    title: 'Zdjęcia',
    description: 'Dodaj zdjęcia, aby zaprezentować swój styl pracy.',
    route: 'TrainerPhotos',
  },
  {
    title: 'Ustawienia',
    description: 'Dostosuj preferencje powiadomień i widoczności.',
    route: 'TrainerSettings',
  },
];

export const TrainerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<TrainerDashboardNavigationProp>();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getTrainerDashboard<DashboardResponse>();
      setDashboard(data);
    } catch (err) {
      const mapped = mapApiError(err, {
        fallbackMessage: 'Nie udało się pobrać danych panelu trenera. Spróbuj ponownie.',
      });

      setError(
        mapped.message ?? 'Nie udało się pobrać danych panelu trenera. Spróbuj ponownie.',
      );
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  const completion = useMemo(() => {
    const rawCompletion =
      dashboard?.profile_completion ??
      dashboard?.profileCompletion ??
      dashboard?.completion ??
      0;

    if (typeof rawCompletion !== 'number' || Number.isNaN(rawCompletion)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(rawCompletion)));
  }, [dashboard]);

  const missingItems = useMemo(() => {
    const missingFromItems = dashboard?.missing_items ?? dashboard?.missingItems;

    if (Array.isArray(missingFromItems)) {
      return missingFromItems;
    }

    const missingFields = (dashboard as any)?.missing_fields ?? (dashboard as any)?.missingFields;

    if (Array.isArray(missingFields)) {
      return missingFields;
    }

    if (missingFields && typeof missingFields === 'object') {
      const personalData = Array.isArray(missingFields.personal_data)
        ? missingFields.personal_data
        : [];
      const profile = Array.isArray(missingFields.profile) ? missingFields.profile : [];

      return [...personalData, ...profile];
    }

    return [];
  }, [dashboard]);

  const isActive = useMemo(() => {
    if (dashboard?.status && typeof dashboard.status === 'object') {
      const status = dashboard.status as { is_public_trainer?: boolean };

      if (typeof status.is_public_trainer === 'boolean') {
        return status.is_public_trainer;
      }
    }

    if (typeof dashboard?.is_public === 'boolean') {
      return dashboard.is_public;
    }

    const normalizedStatus =
      (typeof dashboard?.status === 'string' ? dashboard.status : undefined)?.toUpperCase() ??
      dashboard?.visibility_status?.toUpperCase() ??
      '';

    return normalizedStatus === 'ACTIVE' || normalizedStatus === 'PUBLIC' || normalizedStatus === 'VISIBLE';
  }, [dashboard]);

  const greetingName = useMemo(
    () => (dashboard as any)?.personal_data?.first_name ?? dashboard?.name ?? 'Trenerze',
    [dashboard],
  );

  const statusLabel = isActive ? 'Profil aktywny' : 'Profil ukryty';
  const statusDescription = isActive
    ? 'Twoja wizytówka jest widoczna dla klientów.'
    : 'Twoja wizytówka jest ukryta — uzupełnij brakujące sekcje lub zmień ustawienia widoczności.';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.titleColumn}>
              <Text style={styles.title}>Cześć, {greetingName}!</Text>
              <Text style={styles.subtitle}>
                Sprawdź status swojej wizytówki i uzupełnij brakujące informacje, aby skuteczniej
                docierać do klientów.
              </Text>
            </View>
            <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.hiddenBadge]}>
              <Text style={styles.statusLabel}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.statusDescription}>{statusDescription}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Ukończenie profilu</Text>
            <Text style={styles.sectionMeta}>{completion}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
          <Text style={styles.metaText}>
            Uzupełnij brakujące elementy, aby zwiększyć widoczność w wynikach wyszukiwania.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Brakujące elementy</Text>
            <Text style={styles.sectionMeta}>
              {missingItems.length > 0 ? `${missingItems.length} do uzupełnienia` : 'Kompletne'}
            </Text>
          </View>

          {loading ? (
            <View style={styles.centerRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.metaText}>Ładowanie...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={fetchDashboard}>
                <Text style={styles.retryText}>Spróbuj ponownie</Text>
              </Pressable>
            </View>
          ) : missingItems.length > 0 ? (
            <View style={styles.listColumn}>
              {missingItems.map(item => (
                <View key={item} style={styles.listRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.successText}>Brak brakujących elementów. Świetna robota!</Text>
          )}
        </View>

        <View style={styles.tilesGrid}>
          {dashboardTiles.map(tile => (
            <Pressable
              key={tile.route}
              onPress={() => navigation.navigate(tile.route)}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
            >
              <Text style={styles.tileTitle}>{tile.title}</Text>
              <Text style={styles.tileDescription}>{tile.description}</Text>
              <Text style={styles.tileLink}>Przejdź do sekcji</Text>
            </Pressable>
          ))}
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
  header: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 21,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeBadge: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  hiddenBadge: {
    backgroundColor: '#2f1525',
    borderColor: '#7f1d1d',
  },
  statusLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  statusDescription: {
    color: colors.mutedText,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionMeta: {
    color: colors.mutedText,
    fontSize: 14,
  },
  progressTrack: {
    height: 10,
    borderRadius: 8,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  metaText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    rowGap: spacing.sm,
  },
  tile: {
    width: '50%',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 160,
  },
  tilePressed: {
    opacity: 0.9,
    borderColor: colors.primary,
  },
  tileTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  tileDescription: {
    fontSize: 14,
    color: colors.mutedText,
  },
  tileLink: {
    marginTop: 'auto',
    color: colors.primary,
    fontWeight: '700',
  },
  listColumn: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  listText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    lineHeight: 20,
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
});

