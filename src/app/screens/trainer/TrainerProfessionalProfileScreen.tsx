import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../features/auth/AuthContext';
import { setAuthToken } from '../../../shared/api/httpClient';
import {
  getTrainerOptions,
  getTrainerProfile,
  updateTrainerProfile,
} from '../../../shared/api/trainer.api';
import { mapApiError } from '../../../shared/utils/apiErrors';
import { colors, spacing } from '../../../shared/theme';

interface Option {
  id: string | number;
  label: string;
}

interface TrainerProfileResponse {
  headline?: string;
  bio?: string;
  about?: string;
  years_of_experience?: number;
  yearsOfExperience?: number;
  experience_years?: number;
  specialization_ids?: Array<string | number>;
  specializationIds?: Array<string | number>;
  training_modes?: string[];
  trainingModes?: string[];
  target_group_ids?: Array<string | number>;
  targetGroupIds?: Array<string | number>;
  languages?: string[];
  specialization_options?: unknown[];
  specializations?: unknown[];
  available_specializations?: unknown[];
  training_mode_options?: unknown[];
  training_modes_options?: unknown[];
  available_training_modes?: unknown[];
  target_group_options?: unknown[];
  target_groups?: unknown[];
  available_target_groups?: unknown[];
  profile_completion?: number;
  profileCompletion?: number;
  completion?: number;
}

const toOptionList = (list?: unknown[]): Option[] => {
  if (!Array.isArray(list)) return [];

  return list
    .map(item => {
      if (typeof item === 'string' || typeof item === 'number') {
        return { id: item, label: String(item) };
      }

      if (typeof item === 'object' && item) {
        const id =
          (item as Record<string, unknown>).id ??
          (item as Record<string, unknown>).value ??
          (item as Record<string, unknown>).key ??
          (item as Record<string, unknown>).code ??
          (item as Record<string, unknown>).slug;
        const label =
          (item as Record<string, unknown>).name ??
          (item as Record<string, unknown>).label ??
          (item as Record<string, unknown>).title ??
          (item as Record<string, unknown>).text;

        if (id === undefined || id === null) {
          return null;
        }

        return { id: id as string | number, label: String(label ?? id) };
      }

      return null;
    })
    .filter(Boolean) as Option[];
};

const normalizeSelectionIds = (list?: Array<string | number>): Array<string | number> => {
  if (!Array.isArray(list)) return [];

  return list.map(item => (item ?? '')).filter(item => item !== '');
};

const normalizeTrainingModes = (list?: string[]): string[] => {
  if (!Array.isArray(list)) return [];

  return list.map(mode => String(mode)).filter(Boolean);
};

const mergeOptionLists = (...lists: Array<Option[] | undefined>): Option[] => {
  const merged = new Map<string, Option>();

  lists.forEach(list => {
    list?.forEach(option => {
      const key = String(option.id);

      if (!merged.has(key)) {
        merged.set(key, option);
      }
    });
  });

  return Array.from(merged.values());
};

const clampCompletion = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
};

const getYearsValue = (payload: TrainerProfileResponse): number | undefined => {
  const years =
    payload.experience_years ??
    payload.years_of_experience ??
    payload.yearsOfExperience;

  if (typeof years !== 'number' || Number.isNaN(years)) {
    return undefined;
  }

  return Math.max(0, Math.min(40, Math.round(years)));
};

const normalizeId = (value: string | number) => {
  const numeric = Number(value);

  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return numeric;
  }

  return value;
};

export const TrainerProfessionalProfileScreen: React.FC = () => {
  const { state, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [profileCompletion, setProfileCompletion] = useState(0);

  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [languages, setLanguages] = useState('');

  const [specializationIds, setSpecializationIds] = useState<Array<string | number>>([]);
  const [trainingModes, setTrainingModes] = useState<string[]>([]);
  const [targetGroupIds, setTargetGroupIds] = useState<Array<string | number>>([]);

  const [specializationOptions, setSpecializationOptions] = useState<Option[]>([]);
  const [trainingModeOptions, setTrainingModeOptions] = useState<Option[]>([]);
  const [targetGroupOptions, setTargetGroupOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
    }
  }, [state.token]);

  const hydrateForm = useCallback((payload: TrainerProfileResponse, options?: TrainerProfileResponse) => {
    const bio = payload.bio ?? payload.headline ?? '';
    setHeadline(bio);
    setAbout(payload.about ?? bio);

    const yearsValue = getYearsValue(payload);
    setYearsOfExperience(yearsValue === undefined ? '' : String(yearsValue));

    setSpecializationIds(
      normalizeSelectionIds(payload.specialization_ids ?? payload.specializationIds),
    );
    setTrainingModes(normalizeTrainingModes(payload.training_modes ?? payload.trainingModes));
    setTargetGroupIds(normalizeSelectionIds(payload.target_group_ids ?? payload.targetGroupIds));

    if (Array.isArray(payload.languages)) {
      setLanguages(payload.languages.join(', '));
    } else {
      setLanguages('');
    }

    setSpecializationOptions(
      mergeOptionLists(
        toOptionList(
          payload.specialization_options ??
            payload.specializations ??
            payload.available_specializations ??
            [],
        ),
        toOptionList(options?.available_specializations),
        toOptionList(options?.specialization_options ?? options?.specializations),
      ),
    );
    setTrainingModeOptions(
      mergeOptionLists(
        toOptionList(
          payload.training_mode_options ??
            payload.training_modes_options ??
            payload.available_training_modes ??
            payload.training_modes ??
            [],
        ),
        toOptionList(options?.available_training_modes ?? options?.training_modes),
        toOptionList(options?.training_mode_options ?? options?.training_modes_options),
      ),
    );
    setTargetGroupOptions(
      mergeOptionLists(
        toOptionList(
          payload.target_group_options ??
            payload.target_groups ??
            payload.available_target_groups ??
            [],
        ),
        toOptionList(options?.available_target_groups),
        toOptionList(options?.target_group_options ?? options?.target_groups),
      ),
    );
    setProfileCompletion(
      clampCompletion(
        payload.profile_completion ?? payload.profileCompletion ?? payload.completion ?? 0,
      ),
    );
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!state.token) {
      setLoading(false);
      return;
    }

    setAuthToken(state.token);
    setLoading(true);
    setBannerError('');

    try {
      const optionsPromise = getTrainerOptions<TrainerProfileResponse>().catch(() => undefined);
      const [data, options] = await Promise.all([
        getTrainerProfile<TrainerProfileResponse>(),
        optionsPromise,
      ]);

      hydrateForm(data, options);
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się wczytać profilu zawodowego. Spróbuj ponownie.',
      });

      setBannerError(
        mapped.message ?? 'Nie udało się wczytać profilu zawodowego. Spróbuj ponownie.',
      );
    } finally {
      setLoading(false);
    }
  }, [hydrateForm, state.token]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const showSuccessToast = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Sukces', message);
    }
  }, []);

  const toggleSelection = useCallback(
    (value: string | number, current: Array<string | number>, setter: typeof setSpecializationIds) => {
      const exists = current.some(item => String(item) === String(value));

      if (exists) {
        setter(current.filter(item => String(item) !== String(value)));
      } else {
        setter([...current, value]);
      }
    },
    [],
  );

  const toggleTrainingMode = useCallback(
    (mode: string) => {
      setTrainingModes(prev => {
        const exists = prev.includes(mode);

        if (exists) {
          return prev.filter(item => item !== mode);
        }

        return [...prev, mode];
      });
    },
    [],
  );

  const handleSave = async () => {
    const validationErrors: Record<string, string> = {};
    const trimmedHeadline = headline.trim();
    const trimmedAbout = about.trim();
    const trimmedYears = yearsOfExperience.trim();
    const parsedYears = trimmedYears === '' ? undefined : Number(trimmedYears);

    setBannerError('');
    setFieldErrors({});

    if (!specializationIds.length) {
      validationErrors.specialization_ids = 'Wybierz przynajmniej jedną specjalizację.';
    }

    if (!trainingModes.length) {
      validationErrors.training_modes = 'Wybierz przynajmniej jedną formę treningu.';
    }

    if (trimmedYears) {
      if (!Number.isFinite(parsedYears) || parsedYears < 0 || parsedYears > 40) {
        validationErrors.experience_years = 'Doświadczenie musi mieścić się w zakresie 0-40 lat.';
      }
    }

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }

    setSaving(true);

    if (!state.token) {
      setSaving(false);
      return;
    }

    setAuthToken(state.token);

    const combinedBio = [trimmedHeadline, trimmedAbout].filter(Boolean).join('\n\n');
    const languagesArray = languages
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const payload = {
      bio: combinedBio || undefined,
      experience_years:
        trimmedYears === ''
          ? undefined
          : Math.max(0, Math.min(40, Math.round(Number(trimmedYears)))) || 0,
      specialization_ids: specializationIds.map(normalizeId),
      training_modes: trainingModes,
      target_group_ids: targetGroupIds.map(normalizeId),
      languages: languagesArray,
    };

    try {
      await updateTrainerProfile(payload);
      showSuccessToast('Profil zawodowy został zapisany.');
      await fetchProfile();
      await refreshMe().catch(() => undefined);
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się zapisać zmian. Spróbuj ponownie.',
        fieldNameMap: {
          bio: 'headline',
          experience_years: 'experience_years',
          yearsOfExperience: 'experience_years',
          years_of_experience: 'experience_years',
          specializationIds: 'specialization_ids',
          trainingModes: 'training_modes',
          targetGroupIds: 'target_group_ids',
        },
      });

      if (mapped.fieldErrors) {
        setFieldErrors(mapped.fieldErrors);
      }

      if (mapped.message) {
        setBannerError(mapped.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const completionLabel = useMemo(() => `${profileCompletion}%`, [profileCompletion]);

  const renderOptionChips = (
    options: Option[],
    selected: Array<string | number>,
    onToggle: (value: string | number) => void,
  ) => (
    <View style={styles.chipsContainer}>
      {options.map(option => {
        const isSelected = selected.some(item => String(item) === String(option.id));

        return (
          <Pressable
            key={String(option.id)}
            onPress={() => onToggle(option.id)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Profil zawodowy</Text>
        <Text style={styles.subtitle}>
          Zaktualizuj swoją ofertę, aby klienci wiedzieli, w czym się specjalizujesz. Wybierz
          formy współpracy oraz grupy docelowe.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Ukończenie profilu</Text>
            <Text style={styles.sectionMeta}>{completionLabel}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: completionLabel }]} />
          </View>
          <Text style={styles.metaText}>
            Uzupełnij wszystkie wymagane pola, aby zwiększyć widoczność w wyszukiwarce.
          </Text>
        </View>

        {bannerError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{bannerError}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.metaText}>Ładowanie danych...</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nagłówek</Text>
          <TextInput
            value={headline}
            onChangeText={setHeadline}
            placeholder="Napisz krótko czym się zajmujesz"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            editable={!saving}
          />
          {fieldErrors.headline ? <Text style={styles.errorText}>{fieldErrors.headline}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>O mnie</Text>
          <TextInput
            value={about}
            onChangeText={setAbout}
            placeholder="Opisz swoje doświadczenie i podejście do pracy z klientami"
            placeholderTextColor={colors.mutedText}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!saving}
          />
          {fieldErrors.about ? <Text style={styles.errorText}>{fieldErrors.about}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Języki</Text>
          <TextInput
            value={languages}
            onChangeText={setLanguages}
            placeholder="np. polski, angielski"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            editable={!saving}
          />
          {fieldErrors.languages ? (
            <Text style={styles.errorText}>{fieldErrors.languages}</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Lata doświadczenia</Text>
          <TextInput
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            placeholder="np. 5"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            keyboardType="number-pad"
            editable={!saving}
          />
          <Text style={styles.helperText}>Zakres od 0 do 40 lat.</Text>
          {fieldErrors.experience_years || fieldErrors.years_of_experience ? (
            <Text style={styles.errorText}>
              {fieldErrors.experience_years ?? fieldErrors.years_of_experience}
            </Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Specjalizacje *</Text>
          {renderOptionChips(
            specializationOptions,
            specializationIds,
            value => toggleSelection(value, specializationIds, setSpecializationIds),
          )}
          {fieldErrors.specialization_ids ? (
            <Text style={styles.errorText}>{fieldErrors.specialization_ids}</Text>
          ) : null}
          {!specializationOptions.length ? (
            <Text style={styles.metaText}>
              Brak dostępnych specjalizacji do wyboru. Spróbuj ponownie później.
            </Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Formy treningu *</Text>
          {renderOptionChips(
            trainingModeOptions,
            trainingModes,
            value => toggleTrainingMode(String(value)),
          )}
          {fieldErrors.training_modes ? (
            <Text style={styles.errorText}>{fieldErrors.training_modes}</Text>
          ) : null}
          {!trainingModeOptions.length ? (
            <Text style={styles.metaText}>Brak dostępnych form treningu do wyboru.</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Grupy docelowe</Text>
          {renderOptionChips(
            targetGroupOptions,
            targetGroupIds,
            value => toggleSelection(value, targetGroupIds, setTargetGroupIds),
          )}
          {fieldErrors.target_group_ids ? (
            <Text style={styles.errorText}>{fieldErrors.target_group_ids}</Text>
          ) : null}
          {!targetGroupOptions.length ? (
            <Text style={styles.metaText}>Dodaj grupy docelowe po załadowaniu słownika.</Text>
          ) : null}
        </View>

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
          disabled={saving || loading}
        >
          <Text style={styles.buttonText}>{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}</Text>
        </Pressable>
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
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedText,
    lineHeight: 21,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionMeta: {
    color: colors.mutedText,
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
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderColor: colors.error,
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: 10,
  },
  errorBannerText: {
    color: colors.error,
  },
  loaderContainer: {
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  multilineInput: {
    minHeight: 120,
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.text,
  },
  button: {
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
  },
});
