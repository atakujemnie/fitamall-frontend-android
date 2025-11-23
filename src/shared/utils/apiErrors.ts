import axios from 'axios';
import { ValidationErrorResponse } from '../api/auth.types';
import { logDebug } from './logger';

type FieldMap = Record<string, string>;

interface ErrorMappingOptions {
  fallbackMessage?: string;
  fieldNameMap?: FieldMap;
}

export interface MappedApiError {
  message?: string;
  fieldErrors?: Record<string, string>;
}

const isValidationError = (error: unknown): error is ValidationErrorResponse =>
  typeof error === 'object' && !!error && 'errors' in error;

const normalizeValidationErrors = (error: ValidationErrorResponse, fieldNameMap?: FieldMap) => {
  const mapped: Record<string, string> = {};

  Object.entries(error.errors ?? {}).forEach(([field, messages]) => {
    if (!messages?.length) return;

    const targetField = fieldNameMap?.[field] ?? field;
    mapped[targetField] = messages[0];
  });

  return mapped;
};

export const mapApiError = (
  error: unknown,
  { fallbackMessage = 'Something went wrong. Please try again.', fieldNameMap }: ErrorMappingOptions = {},
): MappedApiError => {
  if (isValidationError(error)) {
    return {
      fieldErrors: normalizeValidationErrors(error, fieldNameMap),
      message: error.message,
    };
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const messageFromApi =
      typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : undefined;

    if (status === 401 || status === 403) {
      return { message: messageFromApi ?? 'Your session has expired. Please log in again.' };
    }

    if (status === 422) {
      return { message: messageFromApi ?? fallbackMessage };
    }

    logDebug('Unhandled API error', status, error.response?.data);

    return { message: messageFromApi ?? fallbackMessage };
  }

  return { message: fallbackMessage };
};
