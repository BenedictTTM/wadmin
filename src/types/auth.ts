export type UserRole =
  | 'STUDENT'
  | 'TEACHER'
  | 'SCHOOL_ADMIN'
  | 'CONTENT_DEVELOPER'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  entitlementActive?: boolean;
  planId?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
