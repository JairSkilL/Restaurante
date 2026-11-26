'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, request, type RequestOptions } from '@/services/api';
import type { Session, SessionUser } from '@/services/types';

const KEY = 'restaurante_session';

interface AuthValue {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authRequest: <T>(path: string, options?: RequestOptions) => Promise<T>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const save = useCallback((next: Session | null) => {
    setSession(next);
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  }, []);

  // localStorage solo existe en el navegador, por eso se lee después de montar
  useEffect(() => {
    try {
      setSession(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
    } catch {
      setSession(null);
    }
    setReady(true);
  }, []);

  const token = session?.token;

  const authRequest = useCallback(
    async <T,>(path: string, options: RequestOptions = {}) => {
      try {
        return await request<T>(path, { ...options, token, cache: 'no-store' });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) save(null);
        throw error;
      }
    },
    [token, save],
  );

  // Comprueba que la sesión guardada siga siendo válida
  useEffect(() => {
    if (token) authRequest('/auth/me').catch(() => undefined);
  }, [token, authRequest]);

  const value = useMemo<AuthValue>(() => {
    const start = async (path: string, data: object) => {
      const result = await request<Session>(path, { method: 'POST', body: JSON.stringify(data) });
      if (result.user.role !== 'cliente') {
        throw new Error('Esta web es para clientes. Los administradores usan el panel.');
      }
      save(result);
    };
    return {
      user: session?.user ?? null,
      ready,
      authRequest,
      login: (email, password) => start('/auth/login', { email, password }),
      register: (name, email, password) => start('/auth/register', { name, email, password }),
      logout: async () => {
        try {
          await authRequest('/auth/logout', { method: 'POST' });
        } catch {
          // La sesión local se cierra aunque el servidor no responda
        }
        save(null);
      },
    };
  }, [session, ready, authRequest, save]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requiere AuthProvider');
  return context;
}
