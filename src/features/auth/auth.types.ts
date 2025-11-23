import { ServiceProvider, User } from '../../shared/api/auth.types';

export type AuthUser = User | ServiceProvider;

export interface AuthState {
  status: 'checking' | 'unauthenticated' | 'authenticated';
  user: AuthUser | null;
  token: string | null;
  serviceProviders: ServiceProvider[];
}
