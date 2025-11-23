import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../features/auth/AuthContext';
import { setAuthToken } from '../../shared/api/httpClient';
import {
  changeTrainerPassword,
  getTrainerDashboard,
  getTrainerMe,
  getTrainerProfile,
  updateTrainerConsents,
  updateTrainerStatus,
} from '../../shared/api/trainer.api';
import { mapApiError } from '../../shared/utils/apiErrors';
import { colors, spacing } from '../../shared/theme';

interface TrainerDashboardResponse {
  email?: string;
  contact_email?: string;
  contactEmail?: string;
  consents?: Record<string, unknown>;
  push_notifications?: unknown;
  pushNotifications?: unknown;
  push_notifications_enabled?: unknown;
  email_notifications?: unknown;
  emailNotifications?: unknown;
  marketing_consent?: unknown;
  marketingConsent?: unknown;
  is_visible?: unknown;
  isVisible?: unknown;
  visibility_status?: unknown;
  can_accept_clients?: unknown;
  canAcceptClients?: unknown;
  accepting_clients?: unknown;
  status?: unknown;
}

interface TrainerProfileResponse {
  email?: string;
  contact_email?: string;
  contactEmail?: string;
  consents?: Record<string, unknown>;
  push_notifications?: unknown;
  pushNotifications?: unknown;
  push_notifications_enabled?: unknown;
  email_notifications?: unknown;
  emailNotifications?: unknown;
  marketing_consent?: unknown;
  marketingConsent?: unknown;
  is_visible?: unknown;
  isVisible?: unknown;
  visibility_status?: unknown;
  can_accept_clients?: unknown;
  canAcceptClients?: unknown;
  accepting_clients?: unknown;
  status?: unknown;
}

interface TrainerMeResponse {
  email?: string;
  contact_email?: string;
  contactEmail?: string;
}

const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['1', 'true', 'yes', 'on', 'public', 'active', 'visible'].includes(normalized)) {
      return true;
    }

    if (['0', 'false', 'no', 'off', 'hidden', 'inactive', 'private'].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const extractBoolean = (
  payload: Record<string, unknown>,
  keys: string[],
  fallback?: boolean,
): boolean | undefined => {
  for (const key of keys) {
    const value = payload[key];
    const normalized = normalizeBoolean(value);

    if (normalized !== undefined) {
      return normalized;
    }
  }

  const nestedConsents = payload.consents;

  if (nestedConsents && typeof nestedConsents === 'object') {
    for (const key of keys) {
      const normalized = normalizeBoolean((nestedConsents as Record<string, unknown>)[key]);

      if (normalized !== undefined) {
        return normalized;
      }
    }
  }

  return fallback;
};

const extractString = (payload: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const getBooleanFromSources = (
  sources: Array<Record<string, unknown> | null>,
  keys: string[],
  fallback = false,
) => {
  for (const source of sources) {
    if (!source) continue;

    const normalized = extractBoolean(source, keys);

    if (normalized !== undefined) {
      return normalized;
    }
  }

  return fallback;
};

const getStringFromSources = (sources: Array<Record<string, unknown> | null>, keys: string[]) => {
  for (const source of sources) {
    if (!source) continue;

    const value = extractString(source, keys);

    if (value) return value;
  }

  return '';
};

export const TrainerSettingsScreen: React.FC = () => {
  const { state } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');

  const [email, setEmail] = useState('');

  const [pushConsent, setPushConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentsSaving, setConsentsSaving] = useState(false);
  const [consentsError, setConsentsError] = useState('');

  const [isVisible, setIsVisible] = useState(false);
  const [canAcceptClients, setCanAcceptClients] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusFieldErrors, setStatusFieldErrors] = useState<Record<string, string>>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
    }
  }, [state.token]);

  const showToast = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Sukces', message);
    }
  }, []);

  const hydrateFromPayloads = useCallback(
    (
      dashboard: TrainerDashboardResponse | null,
      profile: TrainerProfileResponse | null,
      me: TrainerMeResponse | null,
    ) => {
      const sources = [dashboard as Record<string, unknown> | null, profile as Record<string, unknown> | null];
      const emailSources = [...sources, me as Record<string, unknown> | null];

      setPushConsent(
        getBooleanFromSources(sources, ['push_notifications', 'pushNotifications', 'push_notifications_enabled'], false),
      );
      setEmailConsent(
        getBooleanFromSources(sources, ['email_notifications', 'emailNotifications'], false),
      );
      setMarketingConsent(
        getBooleanFromSources(sources, ['marketing_consent', 'marketingConsent', 'marketing'], false),
      );

      setIsVisible(
        getBooleanFromSources(
          sources,
          ['is_visible', 'isVisible', 'visibility_status', 'status', 'visible'],
          false,
        ),
      );
      setCanAcceptClients(
        getBooleanFromSources(
          sources,
          ['can_accept_clients', 'canAcceptClients', 'accepting_clients'],
          false,
        ),
      );

      setEmail(
        getStringFromSources(emailSources, ['email', 'contact_email', 'contactEmail']) ?? '',
      );
    },
    [],
  );

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setLoadingError('');

    try {
      const [dashboard, profile, me] = await Promise.all([
        getTrainerDashboard<TrainerDashboardResponse>(),
        getTrainerProfile<TrainerProfileResponse>(),
        getTrainerMe<TrainerMeResponse>(),
      ]);

      hydrateFromPayloads(dashboard, profile, me);
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się pobrać ustawień. Spróbuj ponownie.',
      });

      setLoadingError(mapped.message ?? 'Nie udało się pobrać ustawień. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }, [hydrateFromPayloads]);

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings]),
  );

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordFieldErrors({});
    setPasswordSaving(true);

    const payload = {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    };

    try {
      await changeTrainerPassword(payload);
      showToast('Hasło zostało zmienione.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się zmienić hasła. Spróbuj ponownie.',
        fieldNameMap: {
          current_password: 'currentPassword',
          password: 'newPassword',
          password_confirmation: 'confirmPassword',
        },
      });

      if (mapped.fieldErrors) {
        setPasswordFieldErrors(mapped.fieldErrors);
      }

      if (mapped.message) {
        setPasswordError(mapped.message);
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleConsentsUpdate = async (update: Partial<{ push: boolean; email: boolean; marketing: boolean }>) => {
    setConsentsError('');
    setConsentsSaving(true);

    const previousState = {
      push: pushConsent,
      email: emailConsent,
      marketing: marketingConsent,
    };

    const nextState = {
      push: update.push ?? pushConsent,
      email: update.email ?? emailConsent,
      marketing: update.marketing ?? marketingConsent,
    };

    setPushConsent(nextState.push);
    setEmailConsent(nextState.email);
    setMarketingConsent(nextState.marketing);

    try {
      await updateTrainerConsents({
        push: nextState.push,
        email: nextState.email,
        marketing: nextState.marketing,
      });
    } catch (error) {
      setPushConsent(previousState.push);
      setEmailConsent(previousState.email);
      setMarketingConsent(previousState.marketing);

      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się zapisać zgód. Spróbuj ponownie.',
      });

      setConsentsError(mapped.message ?? 'Nie udało się zapisać zgód. Spróbuj ponownie.');
    } finally {
      setConsentsSaving(false);
    }
  };

  const handleStatusUpdate = async (update: Partial<{ is_visible: boolean; can_accept_clients: boolean }>) => {
    setStatusError('');
    setStatusFieldErrors({});
    setStatusSaving(true);

    const previousState = { is_visible: isVisible, can_accept_clients: canAcceptClients };
    const nextState = {
      is_visible: update.is_visible ?? isVisible,
      can_accept_clients: update.can_accept_clients ?? canAcceptClients,
    };

    setIsVisible(nextState.is_visible);
    setCanAcceptClients(nextState.can_accept_clients);

    try {
      await updateTrainerStatus({
        is_visible: nextState.is_visible,
        can_accept_clients: nextState.can_accept_clients,
      });
    } catch (error) {
      setIsVisible(previousState.is_visible);
      setCanAcceptClients(previousState.can_accept_clients);

      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się zaktualizować statusu. Spróbuj ponownie.',
        fieldNameMap: {
          is_visible: 'isVisible',
          can_accept_clients: 'canAcceptClients',
        },
      });

      if (mapped.fieldErrors) {
        setStatusFieldErrors(mapped.fieldErrors);
      }

      setStatusError(mapped.message ?? 'Nie udało się zaktualizować statusu. Spróbuj ponownie.');
    } finally {
      setStatusSaving(false);
    }
  };

  const subtitle = useMemo(
    () =>
      'Zarządzaj bezpieczeństwem konta, zgodami komunikacyjnymi oraz widocznością profilu. ' +
      'Adres e-mail jest prezentowany wyłącznie w celach informacyjnych.',
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ustawienia konta trenera</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {loadingError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{loadingError}</Text>
            <Pressable style={styles.retryButton} onPress={fetchSettings}>
              <Text style={styles.retryText}>Spróbuj ponownie</Text>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.metaText}>Ładowanie ustawień...</Text>
          </View>
        ) : null}

        {!loading ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dane dostępu</Text>
                <Text style={styles.sectionMeta}>Zmiana hasła</Text>
              </View>
              <Text style={styles.metaText}>
                Hasło służy do logowania się w panelu. Po poprawnej zmianie pola formularza zostaną
                wyczyszczone.
              </Text>

              {passwordError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{passwordError}</Text>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Aktualne hasło</Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="********"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                  editable={!passwordSaving}
                />
                {passwordFieldErrors.currentPassword ? (
                  <Text style={styles.errorText}>{passwordFieldErrors.currentPassword}</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nowe hasło</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="********"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                  editable={!passwordSaving}
                />
                {passwordFieldErrors.newPassword ? (
                  <Text style={styles.errorText}>{passwordFieldErrors.newPassword}</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Potwierdź nowe hasło</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="********"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                  editable={!passwordSaving}
                />
                {passwordFieldErrors.confirmPassword ? (
                  <Text style={styles.errorText}>{passwordFieldErrors.confirmPassword}</Text>
                ) : null}
              </View>

              <Pressable
                style={[styles.primaryButton, passwordSaving && styles.disabledButton]}
                onPress={handlePasswordSubmit}
                disabled={passwordSaving}
              >
                <Text style={styles.primaryButtonText}>
                  {passwordSaving ? 'Zapisywanie...' : 'Zapisz nowe hasło'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Zgody komunikacyjne</Text>
                <Text style={styles.sectionMeta}>Powiadomienia i marketing</Text>
              </View>
              <Text style={styles.metaText}>
                Wartości przejmują domyślne zgody z panelu oraz profilu. Aktualizacje są zapisywane
                od razu po zmianie przełącznika.
              </Text>

              {consentsError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{consentsError}</Text>
                </View>
              ) : null}

              <View style={styles.switchRow}>
                <View style={styles.switchTextColumn}>
                  <Text style={styles.label}>Powiadomienia push</Text>
                  <Text style={styles.metaText}>Zgoda na wysyłkę powiadomień w aplikacji.</Text>
                </View>
                <Switch
                  value={pushConsent}
                  onValueChange={value => handleConsentsUpdate({ push: value })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={pushConsent ? colors.primary : '#f4f3f4'}
                  disabled={consentsSaving}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextColumn}>
                  <Text style={styles.label}>Powiadomienia e-mail</Text>
                  <Text style={styles.metaText}>Informacje operacyjne i serwisowe na e-mail.</Text>
                </View>
                <Switch
                  value={emailConsent}
                  onValueChange={value => handleConsentsUpdate({ email: value })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={emailConsent ? colors.primary : '#f4f3f4'}
                  disabled={consentsSaving}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextColumn}>
                  <Text style={styles.label}>Zgody marketingowe</Text>
                  <Text style={styles.metaText}>Materiały promocyjne i inspiracje treningowe.</Text>
                </View>
                <Switch
                  value={marketingConsent}
                  onValueChange={value => handleConsentsUpdate({ marketing: value })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={marketingConsent ? colors.primary : '#f4f3f4'}
                  disabled={consentsSaving}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Widoczność profilu</Text>
                <Text style={styles.sectionMeta}>Zarządzaj dostępnością</Text>
              </View>
              <Text style={styles.metaText}>
                Przełączniki korzystają z wartości domyślnych pobranych z panelu i profilu. W razie
                błędu wymagane pola zostaną oznaczone, a ustawienia wrócą do poprzednich wartości.
              </Text>

              {statusError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{statusError}</Text>
                </View>
              ) : null}

              <View style={styles.switchRow}>
                <View style={styles.switchTextColumn}>
                  <Text style={styles.label}>Profil publiczny</Text>
                  <Text style={styles.metaText}>Steruje widocznością wizytówki w wyszukiwarkach.</Text>
                  {statusFieldErrors.isVisible ? (
                    <Text style={styles.errorText}>{statusFieldErrors.isVisible}</Text>
                  ) : null}
                </View>
                <Switch
                  value={isVisible}
                  onValueChange={value => handleStatusUpdate({ is_visible: value })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={isVisible ? colors.primary : '#f4f3f4'}
                  disabled={statusSaving}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextColumn}>
                  <Text style={styles.label}>Przyjmuję nowych klientów</Text>
                  <Text style={styles.metaText}>Pozwala klientom umawiać nowe konsultacje.</Text>
                  {statusFieldErrors.canAcceptClients ? (
                    <Text style={styles.errorText}>{statusFieldErrors.canAcceptClients}</Text>
                  ) : null}
                </View>
                <Switch
                  value={canAcceptClients}
                  onValueChange={value => handleStatusUpdate({ can_accept_clients: value })}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={canAcceptClients ? colors.primary : '#f4f3f4'}
                  disabled={statusSaving}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Adres e-mail</Text>
                <Text style={styles.sectionMeta}>Informacja tylko do odczytu</Text>
              </View>
              <Text style={styles.metaText}>
                Poniższy adres pochodzi z danych profilowych i panelu. Aby go zmienić, skorzystaj z
                ustawień konta podstawowego.
              </Text>

              <View style={styles.readonlyField}>
                <Text style={styles.label}>E-mail</Text>
                <Text style={styles.readonlyValue}>{email || 'Brak danych'}</Text>
              </View>
            </View>
          </>
        ) : null}
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedText,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionMeta: {
    fontSize: 13,
    color: colors.mutedText,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  metaText: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderColor: '#f5c2c0',
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  errorBannerText: {
    color: '#d92d20',
    fontSize: 14,
  },
  errorText: {
    color: '#d92d20',
    fontSize: 12,
    marginTop: spacing.xs / 2,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  switchTextColumn: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  readonlyField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    gap: spacing.xs / 2,
    backgroundColor: colors.background,
  },
  readonlyValue: {
    fontSize: 15,
    color: colors.text,
  },
});

