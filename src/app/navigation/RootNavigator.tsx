import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { useAuth } from '../../features/auth/AuthContext';
import { colors } from '../../shared/theme';

export const RootNavigator: React.FC = () => {
  const { state } = useAuth();

  if (state.status === 'checking') {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return state.status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
