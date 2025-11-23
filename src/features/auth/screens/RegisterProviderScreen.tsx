import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../../app/navigation/AuthNavigator';
import { useAuth } from '../AuthContext';
import { RegisterProviderRequest } from '../../../shared/api/auth.types';
import { colors, spacing } from '../../../shared/theme';
import { mapApiError } from '../../../shared/utils/apiErrors';

export const RegisterProviderScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { registerProvider } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [providerName, setProviderName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bannerError, setBannerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = useMemo(() => /\S+@\S+\.\S+/, []);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!lastName.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!providerName.trim()) {
      errors.provider_name = 'Provider name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    if (!passwordConfirmation) {
      errors.password_confirmation = 'Please confirm your password';
    } else if (password !== passwordConfirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setBannerError('');
    setFieldErrors({});

    if (!validate()) {
      return;
    }

    const address = [city.trim(), country.trim()].filter(Boolean).join(', ');

    const payload: RegisterProviderRequest = {
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      password,
      password_confirmation: passwordConfirmation,
      company_name: providerName.trim(),
      description: description.trim() || undefined,
      address: address || undefined,
    };

    setSubmitting(true);

    try {
      await registerProvider(payload);
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Could not create your provider account. Please try again.',
        fieldNameMap: { name: 'first_name', company_name: 'provider_name' },
      });

      if (mapped.fieldErrors) {
        setFieldErrors(prev => ({ ...prev, ...mapped.fieldErrors }));
      }

      if (mapped.message) {
        setBannerError(mapped.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Register as Provider</Text>
        <Text style={styles.subtitle}>
          Set up your provider profile to offer training sessions.
        </Text>

        {bannerError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{bannerError}</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroupRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jane"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              editable={!submitting}
            />
            {fieldErrors.first_name ? (
              <Text style={styles.errorText}>{fieldErrors.first_name}</Text>
            ) : null}
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Doe"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              editable={!submitting}
            />
            {fieldErrors.last_name ? (
              <Text style={styles.errorText}>{fieldErrors.last_name}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Provider name</Text>
          <TextInput
            value={providerName}
            onChangeText={setProviderName}
            placeholder="Fitamall Training"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            editable={!submitting}
          />
          {fieldErrors.provider_name ? (
            <Text style={styles.errorText}>{fieldErrors.provider_name}</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            editable={!submitting}
          />
          {fieldErrors.email ? <Text style={styles.errorText}>{fieldErrors.email}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>City (optional)</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Warsaw"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            editable={!submitting}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Country (optional)</Text>
          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder="Poland"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            editable={!submitting}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Tell clients what you offer"
            placeholderTextColor={colors.mutedText}
            style={[styles.input, styles.multilineInput]}
            editable={!submitting}
            multiline
            numberOfLines={3}
          />
          {fieldErrors.description ? (
            <Text style={styles.errorText}>{fieldErrors.description}</Text>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            style={styles.input}
            editable={!submitting}
          />
          {fieldErrors.password ? <Text style={styles.errorText}>{fieldErrors.password}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            style={styles.input}
            editable={!submitting}
          />
          {fieldErrors.password_confirmation ? (
            <Text style={styles.errorText}>{fieldErrors.password_confirmation}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Create trainer account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={submitting}>
          <Text style={styles.linkText}>Back to login</Text>
        </TouchableOpacity>
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
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
  },
  fieldGroup: {
    marginTop: spacing.sm,
  },
  fieldGroupRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 96,
  },
  errorText: {
    color: '#f87171',
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: '#7f1d1d',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorBannerText: {
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
