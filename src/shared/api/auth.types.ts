export interface User {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: string[];
}

export interface ServiceProvider extends User {
  provider_name?: string;
  category?: string;
  description?: string;
  city?: string;
  country?: string;
  address?: string;
}

export interface AuthToken {
  token: string;
  plain_text?: string;
  token_type?: string;
  expires_at?: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

export interface RegisterClientRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  channel: 'mobile';
}

export interface RegisterProviderRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  provider_name: string;
  channel: 'mobile';
  city?: string;
  country?: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_name: string;
  channel: 'mobile';
}

export interface RegisterClientResponse {
  user: User;
  token: AuthToken;
}

export interface RegisterProviderResponse {
  user: ServiceProvider;
  token: AuthToken;
}

export interface LoginResponse {
  user: User | ServiceProvider;
  token: AuthToken;
  service_providers?: ServiceProvider[];
}

export interface MeResponse {
  user: User | ServiceProvider;
  service_providers?: ServiceProvider[];
}
