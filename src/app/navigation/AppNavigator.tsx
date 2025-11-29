import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../../shared/theme';
import { FindTrainerScreen } from '../screens/FindTrainerScreen';
import { useAuth } from '../../features/auth/AuthContext';
import { TrainerDashboardScreen } from '../screens/TrainerDashboardScreen';
import { TrainerPersonalDataScreen } from '../screens/trainer/TrainerPersonalDataScreen';
import { TrainerProfessionalProfileScreen } from '../screens/trainer/TrainerProfessionalProfileScreen';
import { TrainerLocationScreen } from '../screens/trainer/TrainerLocationScreen';
import { TrainerPhotosScreen } from '../screens/trainer/TrainerPhotosScreen';
import { TrainerSettingsScreen } from '../screens/TrainerSettingsScreen';

export type MainStackParamList = {
  Home: undefined;
  FindTrainer: undefined;
};

export type TrainerStackParamList = {
  TrainerDashboard: undefined;
  TrainerPersonalData: undefined;
  TrainerProfessionalProfile: undefined;
  TrainerLocation: undefined;
  TrainerPhotos: undefined;
  TrainerSettings: undefined;
};

export type AppTabParamList = {
  Main: NavigatorScreenParams<MainStackParamList>;
  Trainer: NavigatorScreenParams<TrainerStackParamList>;
};

const MainStack = createNativeStackNavigator<MainStackParamList>();
const TrainerStack = createNativeStackNavigator<TrainerStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

const MainStackNavigator: React.FC = () => (
  <MainStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    }}
  >
    <MainStack.Screen name="Home" component={HomeScreen} />
    <MainStack.Screen name="FindTrainer" component={FindTrainerScreen} />
  </MainStack.Navigator>
);

const TrainerStackNavigator: React.FC = () => (
  <TrainerStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    }}
  >
    <TrainerStack.Screen
      name="TrainerDashboard"
      component={TrainerDashboardScreen}
      options={{ title: 'Panel trenera' }}
    />
    <TrainerStack.Screen
      name="TrainerPersonalData"
      component={TrainerPersonalDataScreen}
      options={{ title: 'Dane osobowe' }}
    />
    <TrainerStack.Screen
      name="TrainerProfessionalProfile"
      component={TrainerProfessionalProfileScreen}
      options={{ title: 'Profil zawodowy' }}
    />
    <TrainerStack.Screen
      name="TrainerLocation"
      component={TrainerLocationScreen}
      options={{ title: 'Lokalizacja trenera' }}
    />
    <TrainerStack.Screen
      name="TrainerPhotos"
      component={TrainerPhotosScreen}
      options={{ title: 'Zdjęcia' }}
    />
    <TrainerStack.Screen
      name="TrainerSettings"
      component={TrainerSettingsScreen}
      options={{ title: 'Ustawienia' }}
    />
  </TrainerStack.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { state } = useAuth();
  const normalizedRoles = state.user?.roles?.map(role => role.toUpperCase()) ?? [];
  const hasTrainerRole = normalizedRoles.includes('TRAINER') || normalizedRoles.includes('PROVIDER_OWNER');
  const hasServiceProviderProfile = (state.serviceProviders ?? []).length > 0;
  const isTrainer = hasTrainerRole || hasServiceProviderProfile;

  if (!isTrainer) {
    return <MainStackNavigator />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tab.Screen name="Main" component={MainStackNavigator} options={{ title: 'Aplikacja' }} />
      <Tab.Screen name="Trainer" component={TrainerStackNavigator} options={{ title: 'Trener' }} />
    </Tab.Navigator>
  );
};
