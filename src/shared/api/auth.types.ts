export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceProvider extends User {
  company_name?: string;
  category?: string;
  description?: string;
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
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  channel?: string;
}

export interface RegisterProviderRequest extends RegisterClientRequest {
  company_name?: string;
  category?: string;
  description?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
  channel?: string;
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
}

export interface MeResponse {
  user: User | ServiceProvider;
}
