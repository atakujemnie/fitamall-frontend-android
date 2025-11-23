import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../../shared/theme';
import { FindTrainerScreen } from '../screens/FindTrainerScreen';

export type AppStackParamList = {
  Home: undefined;
  FindTrainer: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="FindTrainer" component={FindTrainerScreen} />
    </Stack.Navigator>
  );
};
