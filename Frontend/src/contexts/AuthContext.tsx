"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { API_CONFIG } from '@/config/api.config';

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Perfil Vocal
  vocalRange?: string | null;
  voiceType?: string | null;
  lowestNote?: string | null;
  highestNote?: string | null;
  comfortableRange?: [string, string] | null;
  vocalRangeSemitones?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'koach_access_token',
  USER: 'koach_user',
} as const;

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // PERSIST USER TO LOCAL STORAGE
  // ============================================
  const persistUser = useCallback((userData: User | null) => {
    if (typeof window === 'undefined') return;
    
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, []);

  // ============================================
  // RESTORE USER FROM LOCAL STORAGE (Initial Load)
  // ============================================
  const restoreUserFromStorage = useCallback((): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (storedUser && storedToken) {
        return JSON.parse(storedUser) as User;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] Error restoring user from storage:', error);
      }
    }
    return null;
  }, []);

  // ============================================
  // FETCH CURRENT USER (Validate token with backend)
  // ============================================
  const fetchCurrentUser = useCallback(async () => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) 
      : null;

    // Solo validar si hay token o usuario guardado
    const storedUser = restoreUserFromStorage();
    if (!token && !storedUser) {
      setUser(null);
      return;
    }

    // Validar con el backend solo si hay token
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/me`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        persistUser(data.user);
        return;
      }

      // Si el token expiró (401/403), limpiar sesión
      if (response.status === 401 || response.status === 403) {
        console.log('[Auth] Token expirado o inválido, cerrando sesión');
        setUser(null);
        persistUser(null);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        return;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] Error validating session:', error);
      }
    }

    // Si la API falla pero había usuario en storage, restaurarlo
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser(null);
      persistUser(null);
    }
  }, [persistUser, restoreUserFromStorage]);

  // ============================================
  // INITIAL LOAD - Restore session
  // ============================================
  useEffect(() => {
    const initAuth = async () => {
      // First, try to restore from localStorage for instant UI
      const storedUser = restoreUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
      }

      // Then validate with backend (async)
      await fetchCurrentUser();
      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser, restoreUserFromStorage]);

  // ============================================
  // LOGIN
  // ============================================
  const login = async (data: LoginData) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const result = await response.json();
    setUser(result.user);
    persistUser(result.user);
    
    // Save access token
    if (result.accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
    }
  };

  // ============================================
  // REGISTER
  // ============================================
  const register = async (data: RegisterData) => {
    const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrarse');
    }

    const result = await response.json();
    setUser(result.user);
    persistUser(result.user);
    
    // Save access token
    if (result.accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken);
    }
  };

  // ============================================
  // ============================================
  // LOGOUT
  // ============================================
  const logout = async () => {
    try {
      await fetch(`${API_CONFIG.baseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Auth] Error during logout:', error);
      }
    } finally {
      setUser(null);
      persistUser(null);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  };

  // ============================================
  // REFRESH USER
  // ============================================
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
