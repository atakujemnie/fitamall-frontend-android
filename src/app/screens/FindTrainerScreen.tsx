import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../shared/theme';
import {
  getTrainerCities,
  getTrainersByCity,
  TrainerListItem,
} from '../../shared/api/trainers.api';

export const FindTrainerScreen: React.FC = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isCityModalVisible, setCityModalVisible] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainersError, setTrainersError] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<TrainerListItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCities = async () => {
      setLoadingCities(true);
      setError(null);

      try {
        const response = await getTrainerCities();

        if (isMounted) {
          setCities(response);
        }
      } catch (err) {
        if (isMounted) {
          setError('Nie udało się wczytać miast. Spróbuj ponownie później.');
        }
      } finally {
        if (isMounted) {
          setLoadingCities(false);
        }
      }
    };

    loadCities();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadTrainers = async (city: string) => {
    setLoadingTrainers(true);
    setTrainersError(null);
    setTrainers([]);

    try {
      const response = await getTrainersByCity(city);

      setTrainers(response);
    } catch (err) {
      setTrainersError('Nie udało się wczytać trenerów. Spróbuj ponownie później.');
    } finally {
      setLoadingTrainers(false);
    }
  };

  const handleSelectCity = async (city: string) => {
    setSelectedCity(city);
    setCityModalVisible(false);
    await loadTrainers(city);
  };

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

        {loadingCities ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.metaText}>Wczytuję dostępne miasta...</Text>
          </View>
        ) : error ? (
          <Text style={[styles.metaText, styles.errorText]}>{error}</Text>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={selectedCity ? `Wybrane miasto ${selectedCity}` : 'Wybierz miasto'}
            style={styles.selector}
            onPress={() => setCityModalVisible(true)}
          >
            <Text style={styles.selectorText}>{selectedCity || 'Wybierz miasto'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dostępni trenerzy</Text>
        {!selectedCity ? (
          <Text style={styles.metaText}>Wybierz miasto, aby zobaczyć listę trenerów.</Text>
        ) : loadingTrainers ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.metaText}>Wczytuję listę trenerów...</Text>
          </View>
        ) : trainersError ? (
          <Text style={[styles.metaText, styles.errorText]}>{trainersError}</Text>
        ) : trainers.length === 0 ? (
          <Text style={styles.metaText}>Brak trenerów w tym mieście.</Text>
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

      <Modal
        visible={isCityModalVisible}
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Wybierz miasto</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Zamknij wybór miasta"
              style={styles.closeButton}
              onPress={() => setCityModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Zamknij</Text>
            </TouchableOpacity>
          </View>

          {loadingCities ? (
            <View style={[styles.loadingRow, styles.modalContentPadding]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.metaText}>Wczytuję dostępne miasta...</Text>
            </View>
          ) : error ? (
            <View style={styles.modalContentPadding}>
              <Text style={[styles.metaText, styles.errorText]}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={cities}
              keyExtractor={item => item}
              contentContainerStyle={styles.modalContentPadding}
              renderItem={({ item }) => (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Wybierz miasto ${item}`}
                  style={styles.cityItem}
                  onPress={() => handleSelectCity(item)}
                >
                  <Text style={styles.cityName}>{item}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  selector: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selectorText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContentPadding: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cityItem: {
    paddingVertical: spacing.md,
  },
  cityName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
