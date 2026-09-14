/**
 * @file contexts/AuthContext.tsx
 * @description Contexto de autenticação unificado.
 * Suporta Google OAuth + JWT (local) e Supabase Auth (produção).
 */

import React, { createContext, useContext, useCallback, useEffect, useReducer } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { authService, isSupabase } from '../services/data';
import type { User, AuthState, AuthAction } from '../types';

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

function decodeGoogleToken(token: string): GooglePayload {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token Google:', error);
    throw new Error('Token inválido');
  }
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true, user: action.payload, isLoading: false, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, isAuthenticated: false, user: null, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  loginWithGoogle: (credentialResponse?: { credential: string }) => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<User | null>(
    'financas_user',
    null
  );

  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    user: storedUser,
    isAuthenticated: !!storedUser,
  });

  useEffect(() => {
    if (isSupabase) {
      authService.getSession().then((session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url,
          };
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          setStoredUser(user);
        }
      }).catch(() => {});

      const { data: { subscription } } = authService.onAuthStateChange((user) => {
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          setStoredUser(user);
        } else {
          dispatch({ type: 'LOGOUT' });
          removeStoredUser();
        }
      });

      return () => subscription.unsubscribe();
    } else {
      if (storedUser) {
        if (!authService.hasStoredToken()) {
          removeStoredUser();
          return;
        }
        dispatch({ type: 'LOGIN_SUCCESS', payload: storedUser });
      } else {
        const cookieToken = authService.getTokenFromCookie();
        if (cookieToken) {
          authService.setAuthToken(cookieToken);
          dispatch({ type: 'LOGIN_START' });
          authService.getCurrentUser()
            .then((userData) => {
              if (userData) {
                const user: User = {
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  avatar: userData.avatar ?? undefined,
                };
                dispatch({ type: 'LOGIN_SUCCESS', payload: user });
                setStoredUser(user);
              }
            })
            .catch(() => {
              authService.setAuthToken(null);
              dispatch({ type: 'LOGOUT' });
            });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = useCallback(
    async (credentialResponse?: { credential: string }) => {
      try {
        dispatch({ type: 'LOGIN_START' });

        if (isSupabase) {
          await authService.signInWithGoogle();
        } else {
          if (!credentialResponse) {
            throw new Error('Credential required for local login');
          }
          const payload = decodeGoogleToken(credentialResponse.credential);
          const dbUser = await authService.createOrFind({
            googleId: payload.sub,
            name: payload.name,
            email: payload.email,
            avatar: payload.picture,
          });

          const user: User = {
            id: dbUser?.id || payload.sub,
            name: dbUser?.name || payload.name,
            email: dbUser?.email || payload.email,
            avatar: dbUser?.avatar || payload.picture,
          };

          if ((dbUser as any).token) {
            authService.setAuthToken((dbUser as any).token);
          }

          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          setStoredUser(user);
        }
      } catch (error) {
        console.error('Erro ao processar login Google:', error);
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Erro ao autenticar com Google.' });
      }
    },
    [setStoredUser]
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT' });
    removeStoredUser();
    authService.setAuthToken(null);
    await authService.signOut();
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, [removeStoredUser]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, loginWithGoogle, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
