import axios, { AxiosResponse } from 'axios';
import { httpClient } from './httpClient';
import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterClientRequest,
  RegisterClientResponse,
  RegisterProviderRequest,
  RegisterProviderResponse,
  ValidationErrorResponse,
} from './auth.types';

const AUTH_CHANNEL = 'mobile';
const DEFAULT_DEVICE_NAME = 'mobile';
const AUTH_BASE_PATH = '/api/auth';

type RequestExecutor<T> = () => Promise<AxiosResponse<T>>;

const handleRequest = async <T>(executor: RequestExecutor<T>): Promise<T> => {
  try {
    const response = await executor();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 422 && error.response?.data) {
        throw error.response.data as ValidationErrorResponse;
      }

      if (status === 401 || status === 403) {
        throw error;
      }
    }

    throw error;
  }
};

export const registerClient = async (
  payload: RegisterClientRequest,
): Promise<RegisterClientResponse> => {
  const requestPayload = {
    ...payload,
    channel: AUTH_CHANNEL,
  };

  return handleRequest(() =>
    httpClient.post<RegisterClientResponse>(
      `${AUTH_BASE_PATH}/register/client`,
      requestPayload,
    ),
  );
};

export const registerProvider = async (
  payload: RegisterProviderRequest,
): Promise<RegisterProviderResponse> => {
  const requestPayload = {
    ...payload,
    channel: AUTH_CHANNEL,
  };

  return handleRequest(() =>
    httpClient.post<RegisterProviderResponse>(
      `${AUTH_BASE_PATH}/register/provider`,
      requestPayload,
    ),
  );
};

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const requestPayload = {
    ...payload,
    channel: AUTH_CHANNEL,
    device_name: payload.device_name ?? DEFAULT_DEVICE_NAME,
  };

  return handleRequest(() =>
    httpClient.post<LoginResponse>(`${AUTH_BASE_PATH}/login`, requestPayload),
  );
};

export const logout = async (): Promise<void> => {
  await handleRequest<void>(() => httpClient.post(`${AUTH_BASE_PATH}/logout`));
};

export const getMe = async (): Promise<MeResponse> =>
  handleRequest(() => httpClient.get<MeResponse>(`${AUTH_BASE_PATH}/me`));
