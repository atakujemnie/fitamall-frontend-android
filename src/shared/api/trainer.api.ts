import axios, { AxiosResponse } from 'axios';
import { httpClient } from './httpClient';
import { ValidationErrorResponse } from './auth.types';

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

const TRAINER_BASE_PATH = '/api/trainer';
const TRAINER_ME_PATH = '/api/trainer/me';

export const getTrainerDashboard = async <T = unknown>(): Promise<T> =>
  handleRequest(() => httpClient.get<T>(`${TRAINER_BASE_PATH}/dashboard`));

export const getTrainerPersonalData = async <T = unknown>(): Promise<T> =>
  handleRequest(() => httpClient.get<T>(`${TRAINER_BASE_PATH}/personal-data`));

export const updateTrainerPersonalData = async <T = unknown, P = unknown>(
  payload: P,
): Promise<T> =>
  handleRequest(() =>
    httpClient.put<T>(`${TRAINER_BASE_PATH}/personal-data`, payload),
  );

export const getTrainerProfile = async <T = unknown>(): Promise<T> =>
  handleRequest(() => httpClient.get<T>(`${TRAINER_BASE_PATH}/profile`));

export const updateTrainerProfile = async <T = unknown, P = unknown>(
  payload: P,
): Promise<T> =>
  handleRequest(() => httpClient.put<T>(`${TRAINER_BASE_PATH}/profile`, payload));

export const getTrainerMe = async <T = unknown>(): Promise<T> =>
  handleRequest(() => httpClient.get<T>(TRAINER_ME_PATH));

export const updateTrainerMe = async <T = unknown, P = unknown>(payload: P): Promise<T> =>
  handleRequest(() => httpClient.put<T>(TRAINER_ME_PATH, payload));

export const uploadTrainerAvatar = async <T = unknown>(
  formData: FormData,
): Promise<T> =>
  handleRequest(() =>
    httpClient.post<T>(`${TRAINER_BASE_PATH}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  );

export const deleteTrainerAvatar = async (): Promise<void> =>
  handleRequest(() => httpClient.delete(`${TRAINER_BASE_PATH}/avatar`));

export const getTrainerPhotos = async <T = unknown>(): Promise<T> =>
  handleRequest(() => httpClient.get<T>(`${TRAINER_BASE_PATH}/photos`));

export const uploadTrainerPhoto = async <T = unknown>(
  formData: FormData,
): Promise<T> =>
  handleRequest(() =>
    httpClient.post<T>(`${TRAINER_BASE_PATH}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  );

export const deleteTrainerPhoto = async (
  photoId: string | number,
): Promise<void> =>
  handleRequest(() =>
    httpClient.delete(`${TRAINER_BASE_PATH}/photos/${photoId}`),
  );

export const changeTrainerPassword = async <T = unknown, P = unknown>(
  payload: P,
): Promise<T> =>
  handleRequest(() =>
    httpClient.post<T>(`${TRAINER_BASE_PATH}/change-password`, payload),
  );

export const updateTrainerConsents = async <T = unknown, P = unknown>(
  payload: P,
): Promise<T> =>
  handleRequest(() =>
    httpClient.put<T>(`${TRAINER_BASE_PATH}/settings/consents`, payload),
  );

export const updateTrainerStatus = async <T = unknown, P = unknown>(
  payload: P,
): Promise<T> =>
  handleRequest(() => httpClient.put<T>(`${TRAINER_BASE_PATH}/status`, payload));
