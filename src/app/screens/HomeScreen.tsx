import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../shared/theme';
import { useAuth } from '../../features/auth/AuthContext';
import { ServiceProvider } from '../../shared/api/auth.types';
import { AppStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { state, logout } = useAuth();
  const user = state.user;
  const serviceProviders = state.serviceProviders ?? [];

  const fullName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.name
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome{fullName ? `, ${fullName}` : ''}!</Text>
        <Text style={styles.subtitle}>You're signed in as {user?.email ?? 'unknown user'}.</Text>
        {user?.roles?.length ? (
          <Text style={styles.metaText}>Roles: {user.roles.join(', ')}</Text>
        ) : null}

        <Pressable
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('FindTrainer')}
        >
          <Text style={styles.actionButtonText}>Znajdź trenera</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.metaText}>Name: {fullName || user?.name || 'N/A'}</Text>
        <Text style={styles.metaText}>Email: {user?.email ?? 'N/A'}</Text>
        {user?.phone ? <Text style={styles.metaText}>Phone: {user.phone}</Text> : null}
      </View>

      {serviceProviders.length ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service providers</Text>
          <FlatList
            data={serviceProviders}
            keyExtractor={(item: ServiceProvider) => `${item.id}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <View style={styles.providerRow}>
                <Text style={styles.providerName}>{item.provider_name ?? item.name}</Text>
                {item.description ? (
                  <Text style={styles.metaText}>{item.description}</Text>
                ) : null}
                {item.address ? <Text style={styles.metaText}>{item.address}</Text> : null}
              </View>
            )}
          />
        </View>
      ) : null}

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
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
  actionButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metaText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  providerRow: {
    gap: 2,
    paddingVertical: spacing.xs,
  },
  providerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  logoutButton: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.text,
    fontWeight: '700',
  },
});
