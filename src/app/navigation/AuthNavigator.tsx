import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { RegisterClientScreen } from '../../features/auth/screens/RegisterClientScreen';
import { RegisterProviderScreen } from '../../features/auth/screens/RegisterProviderScreen';
import { PublicHomeScreen } from '../screens/PublicHomeScreen';
import { colors } from '../../shared/theme';

export type AuthStackParamList = {
  PublicHome: undefined;
  Login: undefined;
  RegisterClient: undefined;
  RegisterProvider: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PublicHome"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="PublicHome"
        component={PublicHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterClient" component={RegisterClientScreen} />
      <Stack.Screen name="RegisterProvider" component={RegisterProviderScreen} />
    </Stack.Navigator>
  );
};
