import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { logDebug } from '../utils/logger';

const BASE_URL = 'http://localhost:8000';


const AUTH_HEADER = 'Authorization';

export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let currentToken: string | undefined;
let unauthorizedHandler: (() => void | Promise<void>) | undefined;

httpClient.interceptors.request.use(config => {
  if (currentToken && config.headers) {
    config.headers[AUTH_HEADER] = `Bearer ${currentToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      try {
        await unauthorizedHandler?.();
      } catch (handlerError) {
        logDebug('Unauthorized handler failed', handlerError);
      }
    }

    return Promise.reject(error);
  },
);

export const setAuthToken = (token?: string) => {
  currentToken = token;

  if (token) {
    httpClient.defaults.headers.common[AUTH_HEADER] = `Bearer ${token}`;
  } else {
    delete httpClient.defaults.headers.common[AUTH_HEADER];
  }
};

export const setUnauthorizedHandler = (handler?: () => void | Promise<void>) => {
  unauthorizedHandler = handler;
};
