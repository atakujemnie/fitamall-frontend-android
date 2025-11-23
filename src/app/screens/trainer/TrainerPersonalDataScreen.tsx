import React, { useCallback, useEffect, useState } from 'react';
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
  getTrainerPersonalData,
  updateTrainerPersonalData,
} from '../../../shared/api/trainer.api';
import { mapApiError } from '../../../shared/utils/apiErrors';
import { colors, spacing } from '../../../shared/theme';

type TrainerPersonalDataResponse = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
};

export const TrainerPersonalDataScreen: React.FC = () => {
  const { state } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
    }
  }, [state.token]);

  const hydrateForm = useCallback((payload: TrainerPersonalDataResponse) => {
    setFirstName(payload.first_name ?? '');
    setLastName(payload.last_name ?? '');
    setEmail(payload.email ?? '');
    setPhone(payload.phone ?? '');
    setCity(payload.city ?? '');
    setCountry(payload.country ?? '');
  }, []);

  const fetchPersonalData = useCallback(async () => {
    setLoading(true);
    setBannerError('');

    try {
      const data = await getTrainerPersonalData<TrainerPersonalDataResponse>();
      hydrateForm(data);
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się załadować danych osobowych. Spróbuj ponownie.',
      });

      setBannerError(
        mapped.message ?? 'Nie udało się załadować danych osobowych. Spróbuj ponownie.',
      );
    } finally {
      setLoading(false);
    }
  }, [hydrateForm]);

  useFocusEffect(
    useCallback(() => {
      fetchPersonalData();
    }, [fetchPersonalData]),
  );

  const showSuccessToast = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Sukces', message);
    }
  }, []);

  const handleSave = async () => {
    setBannerError('');
    setFieldErrors({});
    setSaving(true);

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
    };

    try {
      await updateTrainerPersonalData(payload);
      showSuccessToast('Dane zostały zapisane.');
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się zapisać danych. Spróbuj ponownie.',
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Dane osobowe</Text>
        <Text style={styles.subtitle}>
          Zaktualizuj swoje dane kontaktowe i adresowe. Adres e-mail jest widoczny tylko do odczytu.
        </Text>

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

        <View style={styles.fieldGroupRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Imię</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jan"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              editable={!saving}
            />
            {fieldErrors.first_name ? (
              <Text style={styles.errorText}>{fieldErrors.first_name}</Text>
            ) : null}
          </View>

          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Nazwisko</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Kowalski"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              editable={!saving}
            />
            {fieldErrors.last_name ? (
              <Text style={styles.errorText}>{fieldErrors.last_name}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail</Text>
          <View style={[styles.input, styles.readOnlyField]}>
            <Text style={styles.readOnlyText}>{email || 'Brak adresu e-mail'}</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+48 600 000 000"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            keyboardType="phone-pad"
            editable={!saving}
          />
          {fieldErrors.phone ? <Text style={styles.errorText}>{fieldErrors.phone}</Text> : null}
        </View>

        <View style={styles.fieldGroupRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Miasto</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Warszawa"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              editable={!saving}
            />
            {fieldErrors.city ? <Text style={styles.errorText}>{fieldErrors.city}</Text> : null}
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Kraj</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Polska"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              editable={!saving}
            />
            {fieldErrors.country ? <Text style={styles.errorText}>{fieldErrors.country}</Text> : null}
          </View>
        </View>


        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedText,
    lineHeight: 21,
  },
  loaderContainer: {
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldGroupRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fieldHalf: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
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
  readOnlyField: {
    justifyContent: 'center',
  },
  readOnlyText: {
    color: colors.mutedText,
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
  metaText: {
    color: colors.mutedText,
    fontSize: 14,
  },
});
