import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../../shared/theme';
import { TrainerStackParamList } from '../../navigation/AppNavigator';

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
    description: 'Zaktualizuj swoje doświadczenie, specjalizacje i ofertę.',
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

type TrainerDashboardNavigationProp = NativeStackNavigationProp<
  TrainerStackParamList,
  'TrainerDashboard'
>;

export const TrainerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<TrainerDashboardNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Panel trenera</Text>
      <Text style={styles.subtitle}>
        Zarządzaj swoim profilem i widocznością, aby skuteczniej docierać do klientów.
      </Text>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
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
    minHeight: 150,
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
});
