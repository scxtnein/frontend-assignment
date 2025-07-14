import { createContext, useEffect, useState } from 'react';

import type { User } from '@/lib/auth/core/schemas';
import { AUTH_STORAGE_KEY } from '@/lib/auth/core/constants';

export interface AuthContext {
  isLoading: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

const DEFAULT_AUTH_STATE: AuthContext = {
  isLoading: false,
  user: null,
  isAuthenticated: false,
};

interface ExtendedAuthContext extends AuthContext {
  setIsLoading: (isLoading: boolean) => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<ExtendedAuthContext | null>(null);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [authState, setAuthState] = useState<AuthContext>({
    ...DEFAULT_AUTH_STATE,
    isLoading: true,
  });

  // Init auth from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        setAuthState({
          isLoading: false,
          user,
          isAuthenticated: !!user,
        });
      } else {
        setAuthState(DEFAULT_AUTH_STATE);
      }
    } catch {
      alert('Error loading auth from local storage');
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState(DEFAULT_AUTH_STATE);
    }
  }, []);

  const setIsLoading = (isLoading: boolean) => {
    setAuthState((prev) => ({ ...prev, isLoading }));
  };

  const setUser = (user: User | null) => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setAuthState((prev) => ({ ...prev, user, isAuthenticated: true }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState((prev) => ({ ...prev, user: null, isAuthenticated: false }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, setIsLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
