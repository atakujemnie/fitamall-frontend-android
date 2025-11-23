import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  registerClient as registerClientRequest,
  registerProvider as registerProviderRequest,
} from '../../shared/api/auth.api';
import {
  AuthToken,
  LoginRequest,
  RegisterClientRequest,
  RegisterProviderRequest,
} from '../../shared/api/auth.types';
import { setAuthToken, setUnauthorizedHandler } from '../../shared/api/httpClient';
import { AuthState, AuthUser } from './auth.types';
import { logDebug } from '../../shared/utils/logger';

interface AuthContextValue {
  state: AuthState;
  registerClient: (form: RegisterClientRequest) => Promise<AuthUser>;
  registerProvider: (form: RegisterProviderRequest) => Promise<AuthUser>;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<AuthUser>;
}

const AUTH_TOKEN_KEY = '@fitamall/auth_token';
const AUTH_CHANNEL: RegisterClientRequest['channel'] = 'mobile';
const DEFAULT_DEVICE_NAME = 'fitamall-mobile';

const initialState: AuthState = {
  status: 'checking',
  user: null,
  token: null,
  serviceProviders: [],
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const extractToken = (token: AuthToken): string => {
  const plainToken = token.plain_text ?? token.token;

  if (!plainToken) {
    throw new Error('Authentication token is missing');
  }

  return plainToken;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const persistTokenAndFetchUser = useCallback(async (token: AuthToken) => {
    const tokenValue = extractToken(token);

    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, tokenValue);
      setAuthToken(tokenValue);

      const me = await getMe();

      setState(prev => ({
        ...prev,
        status: 'authenticated',
        token: tokenValue,
        user: me.user,
        serviceProviders: me.service_providers ?? [],
      }));

      return me.user;
    } catch (error) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthToken();
      setState({ status: 'unauthenticated', user: null, token: null, serviceProviders: [] });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthToken();
      setState({ status: 'unauthenticated', user: null, token: null, serviceProviders: [] });
    }
  }, []);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const requestPayload: LoginRequest = {
        ...payload,
        channel: AUTH_CHANNEL,
        device_name: payload.device_name ?? DEFAULT_DEVICE_NAME,
      };
      const response = await loginRequest(requestPayload);

      return persistTokenAndFetchUser(response.token);
    },
    [persistTokenAndFetchUser],
  );

  const registerClient = useCallback(
    async (form: RegisterClientRequest) => {
      const payload: RegisterClientRequest = {
        ...form,
        channel: AUTH_CHANNEL,
      };
      const response = await registerClientRequest(payload);

      return persistTokenAndFetchUser(response.token);
    },
    [persistTokenAndFetchUser],
  );

  const registerProvider = useCallback(
    async (form: RegisterProviderRequest) => {
      const payload: RegisterProviderRequest = {
        ...form,
        channel: AUTH_CHANNEL,
      };
      const response = await registerProviderRequest(payload);

      return persistTokenAndFetchUser(response.token);
    },
    [persistTokenAndFetchUser],
  );

  const refreshMe = useCallback(async () => {
    if (!state.token) {
      throw new Error('Cannot refresh profile without an authentication token');
    }

    setAuthToken(state.token);
    const me = await getMe();

    setState(prev => ({
      ...prev,
      status: 'authenticated',
      user: me.user,
      serviceProviders: me.service_providers ?? [],
    }));

    return me.user;
  }, [state.token]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

        if (!storedToken) {
          setAuthToken();
          setState({ status: 'unauthenticated', user: null, token: null, serviceProviders: [] });
          return;
        }

        setAuthToken(storedToken);
        const me = await getMe();

        setState({
          status: 'authenticated',
          user: me.user,
          token: storedToken,
          serviceProviders: me.service_providers ?? [],
        });
      } catch (error) {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken();
        setState({ status: 'unauthenticated', user: null, token: null, serviceProviders: [] });
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      logDebug('Authentication token rejected; clearing session');
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthToken();
      setState({ status: 'unauthenticated', user: null, token: null, serviceProviders: [] });
    });

    return () => setUnauthorizedHandler();
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      state,
      registerClient,
      registerProvider,
      login,
      logout,
      refreshMe,
    }),
    [state, registerClient, registerProvider, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
