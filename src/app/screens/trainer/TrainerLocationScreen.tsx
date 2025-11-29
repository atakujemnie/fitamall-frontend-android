import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../features/auth/AuthContext';
import { setAuthToken } from '../../../shared/api/httpClient';
import { getTrainerPersonalData } from '../../../shared/api/trainer.api';
import { mapApiError } from '../../../shared/utils/apiErrors';
import { colors, spacing } from '../../../shared/theme';

type TrainerProfileWithCoordinates = {
  latitude?: string | number | null;
  longitude?: string | number | null;
};

type TrainerPersonalDataResponse = {
  city?: string;
  country?: string;
  address?: string;
  postal_code?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  user?: Partial<TrainerPersonalDataResponse>;
  service_provider?: Partial<TrainerPersonalDataResponse>;
  trainer_profile?: TrainerProfileWithCoordinates;
};

const isValuePresent = (value: unknown) =>
  value !== undefined && value !== null && String(value).trim().length > 0;

const pickFirstPresent = <T extends unknown>(...values: T[]): T | undefined =>
  values.find((value) => isValuePresent(value));

export const TrainerLocationScreen: React.FC = () => {
  const { state } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [personalData, setPersonalData] = useState<TrainerPersonalDataResponse | null>(null);

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
    }
  }, [state.token]);

  const fetchLocationData = useCallback(async () => {
    if (!state.token) {
      setLoading(false);
      setPersonalData(null);
      return;
    }

    setAuthToken(state.token);
    setLoading(true);
    setError('');

    try {
      const data = await getTrainerPersonalData<TrainerPersonalDataResponse>();
      setPersonalData(data);
    } catch (err) {
      const mapped = mapApiError(err, {
        fallbackMessage: 'Nie udało się załadować lokalizacji trenera. Spróbuj ponownie.',
      });

      setError(mapped.message ?? 'Nie udało się załadować lokalizacji trenera. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }, [state.token]);

  useFocusEffect(
    useCallback(() => {
      fetchLocationData();
    }, [fetchLocationData]),
  );

  const locationFields = useMemo(() => {
    const city = pickFirstPresent(
      personalData?.city,
      personalData?.user?.city,
      personalData?.service_provider?.city,
    );
    const country = pickFirstPresent(
      personalData?.country,
      personalData?.user?.country,
      personalData?.service_provider?.country,
    );
    const address = pickFirstPresent(
      personalData?.address,
      personalData?.user?.address,
      personalData?.service_provider?.address,
    );
    const postalCode = pickFirstPresent(
      personalData?.postal_code,
      personalData?.user?.postal_code,
      personalData?.service_provider?.postal_code,
    );

    const latitude = pickFirstPresent(
      personalData?.trainer_profile?.latitude,
      personalData?.latitude,
      personalData?.user?.latitude,
    );
    const longitude = pickFirstPresent(
      personalData?.trainer_profile?.longitude,
      personalData?.longitude,
      personalData?.user?.longitude,
    );

    const hasCoordinateFields =
      personalData?.trainer_profile !== undefined ||
      personalData?.latitude !== undefined ||
      personalData?.longitude !== undefined ||
      personalData?.user?.latitude !== undefined ||
      personalData?.user?.longitude !== undefined;

    const coordinatesPresent =
      hasCoordinateFields && isValuePresent(latitude) && isValuePresent(longitude);

    return { city, country, address, postalCode, hasCoordinateFields, coordinatesPresent };
  }, [personalData]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.metaText}>Ładowanie lokalizacji...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={[styles.button, styles.secondaryButton]} onPress={fetchLocationData}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.successContent}>
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Jak to działa?</Text>
          <Text style={styles.bodyText}>
            Twoja główna lokalizacja treningów jest obliczana na podstawie adresu z sekcji Dane
            osobowe.
          </Text>
          <Text style={styles.bodyText}>
            Adres ten jest używany w wyszukiwarce do pokazywania Cię klientom w promieniu 10–15 km.
          </Text>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Twoja lokalizacja używana w wyszukiwarce</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Miasto</Text>
            <Text style={styles.fieldValue}>{locationFields.city ?? 'Brak danych'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Ulica i numer</Text>
            <Text style={styles.fieldValue}>{locationFields.address ?? 'Brak danych'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kod pocztowy</Text>
            <Text style={styles.fieldValue}>{locationFields.postalCode ?? 'Brak danych'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kraj</Text>
            <Text style={styles.fieldValue}>{locationFields.country ?? 'Brak danych'}</Text>
          </View>

          {locationFields.hasCoordinateFields ? (
            <View style={[styles.statusBadge, locationFields.coordinatesPresent ? styles.successBadge : styles.warningBadge]}>
              <Text
                style={[
                  styles.statusText,
                  locationFields.coordinatesPresent ? styles.successText : styles.warningText,
                ]}
              >
                {locationFields.coordinatesPresent
                  ? 'Lokalizacja jest poprawnie zapisana (współrzędne obecne).'
                  : 'Brak współrzędnych – uzupełnij poprawny adres w danych osobowych, aby pojawiać się w wyszukiwarce po lokalizacji.'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Lokalizacja trenera</Text>
        {renderContent()}
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
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  metaText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  errorContainer: {
    gap: spacing.sm,
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: colors.text,
  },
  successContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  bodyText: {
    fontSize: 14,
    color: colors.mutedText,
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.mutedText,
    fontSize: 14,
  },
  fieldValue: {
    color: colors.text,
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'right',
  },
  statusBadge: {
    padding: spacing.sm,
    borderRadius: 10,
  },
  successBadge: {
    backgroundColor: '#e0f2fe',
  },
  warningBadge: {
    backgroundColor: '#fef9c3',
  },
  statusText: {
    fontSize: 13,
    lineHeight: 18,
  },
  successText: {
    color: '#0369a1',
  },
  warningText: {
    color: '#854d0e',
  },
});
