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
import { LoginRequest } from '../../../shared/api/auth.types';
import { colors, spacing } from '../../../shared/theme';
import { mapApiError } from '../../../shared/utils/apiErrors';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bannerError, setBannerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = useMemo(() => /\S+@\S+\.\S+/, []);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
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

    setSubmitting(true);

    try {
      const payload: LoginRequest = {
        email: email.trim(),
        password,
        channel: 'mobile',
        device_name: 'fitamall-mobile',
      };

      await login(payload);
    } catch (error) {
      const mapped = mapApiError(error, { fallbackMessage: 'Invalid credentials.' });

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
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Authenticate to access your account.</Text>

        {bannerError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{bannerError}</Text>
          </View>
        ) : null}

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

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterClient')}
            disabled={submitting}
          >
            <Text style={styles.linkText}>Create client account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterProvider')}
            disabled={submitting}
          >
            <Text style={styles.linkText}>Create trainer account</Text>
          </TouchableOpacity>
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
  linksRow: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
