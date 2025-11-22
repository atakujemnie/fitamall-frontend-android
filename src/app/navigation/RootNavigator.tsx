import React from 'react';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export const RootNavigator: React.FC = () => {
  // Authentication flow will be controlled by context/state in future iterations.
  const isAuthenticated = false;

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};
