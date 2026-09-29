'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredUser,
  loginApi,
  logoutApi,
  setStoredAuth,
} from '../api/auth';
import type { AuthUser, LoginCredentials } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_ADMIN_ROLES = ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER', 'SCHOOL_ADMIN'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Rehydrate session from localStorage on mount
    try {
      const storedToken = getStoredAccessToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        clearStoredAuth();
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Failed to load stored auth session:', e);
      clearStoredAuth();
    } finally {
      setIsLoading(false);
    }

    // Listen for auth-invalidated events (e.g. from axios 401 interceptor)
    const handleAuthInvalidated = () => {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      router.push('/login?session_expired=1');
    };

    window.addEventListener('auth:invalidated', handleAuthInvalidated);
    return () => {
      window.removeEventListener('auth:invalidated', handleAuthInvalidated);
    };
  }, [router]);

  const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
    const response = await loginApi(credentials);

    // Verify role permissions for admin portal
    if (!ALLOWED_ADMIN_ROLES.includes(response.user.role)) {
      clearStoredAuth();
      throw new Error(
        `Access denied: Your account role (${response.user.role}) is not authorized for the admin portal.`,
      );
    }

    setStoredAuth(response);
    setToken(response.accessToken);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
