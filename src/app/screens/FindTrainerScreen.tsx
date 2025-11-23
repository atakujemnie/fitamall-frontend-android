import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing } from '../../shared/theme';
import {
  getTrainerFilters,
  getTrainersByCity,
  TrainerFiltersResponse,
  TrainerListItem,
} from '../../shared/api/trainers.api';

export const FindTrainerScreen: React.FC = () => {
  const [filters, setFilters] = useState<TrainerFiltersResponse | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);
  const [isTrainersLoading, setIsTrainersLoading] = useState(false);
  const [trainersError, setTrainersError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFilters = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getTrainerFilters();

        if (isMounted) {
          setFilters(response);
        }
      } catch (err) {
        if (isMounted) {
          setError('Nie udało się wczytać filtrów trenerów. Spróbuj ponownie później.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFilters();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadTrainers = async () => {
      if (!selectedCity) {
        setTrainers([]);
        setTrainersError(null);
        return;
      }

      setIsTrainersLoading(true);
      setTrainersError(null);
      setTrainers([]);

      try {
        const response = await getTrainersByCity(selectedCity);

        if (isMounted) {
          setTrainers(response);
        }
      } catch (err) {
        if (isMounted) {
          setTrainersError('Nie udało się wczytać trenerów. Spróbuj ponownie później.');
        }
      } finally {
        if (isMounted) {
          setIsTrainersLoading(false);
        }
      }
    };

    loadTrainers();

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  const cities = filters?.cities ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Znajdź trenera</Text>
        <Text style={styles.subtitle}>
          Wybierz miasto, aby zobaczyć dostępnych trenerów w Twojej okolicy.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Miasto</Text>

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.metaText}>Wczytuję dostępne miasta...</Text>
          </View>
        ) : error ? (
          <Text style={[styles.metaText, styles.errorText]}>{error}</Text>
        ) : (
          <Picker
            selectedValue={selectedCity}
            onValueChange={value => setSelectedCity(String(value))}
            dropdownIconColor={colors.text}
            style={styles.picker}
          >
            <Picker.Item label="Wybierz miasto" value="" enabled={false} />
            {cities.map(city => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dostępni trenerzy</Text>
        {!selectedCity ? (
          <Text style={styles.metaText}>Wybierz miasto, aby zobaczyć listę trenerów.</Text>
        ) : isTrainersLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.metaText}>Wczytuję listę trenerów...</Text>
          </View>
        ) : trainersError ? (
          <Text style={[styles.metaText, styles.errorText]}>{trainersError}</Text>
        ) : trainers.length === 0 ? (
          <Text style={styles.metaText}>Brak trenerów w wybranym mieście.</Text>
        ) : (
          <FlatList
            data={trainers}
            keyExtractor={(item, index) => `${item.id ?? `${item.first_name}-${item.last_name}`}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.trainerItem}>
                <Text style={styles.trainerName}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={styles.metaText}>{item.city}</Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  metaText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  errorText: {
    color: '#d14343',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  picker: {
    backgroundColor: colors.background,
    color: colors.text,
  },
  trainerItem: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  trainerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
