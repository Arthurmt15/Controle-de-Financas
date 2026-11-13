/**
 * @file contexts/AuthContext.tsx
 * @description Contexto de autenticação unificado.
 * A sessão do Supabase Auth é a única fonte de verdade: o localStorage é usado
 * apenas como cache de exibição do usuário, nunca como prova de autenticação.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { authService, isSupabase } from '../services/data';
import { playSound } from '../utils/sounds';
import type { User, AuthState, AuthAction } from '../types';

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
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  /** true enquanto a sessão inicial ainda está sendo verificada */
  isInitializing: boolean;
  loginWithGoogle: (credentialResponse?: { credential: string }) => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setStoredUser, removeStoredUser] = useLocalStorage<User | null>(
    'financas_user',
    null
  );

  const [state, dispatch] = useReducer(authReducer, initialState);
  // Sempre inicia "verificando" quando há sessão remota a validar.
  const [isInitializing, setIsInitializing] = useState(isSupabase);

  useEffect(() => {
    if (!isSupabase) {
      // Login local legado está desativado: nunca confiar no localStorage.
      dispatch({ type: 'LOGOUT' });
      removeStoredUser();
      setIsInitializing(false);
      return;
    }

    let active = true;

    authService
      .getSession()
      .then(async (session) => {
        if (!session?.user) {
          removeStoredUser();
          if (active) dispatch({ type: 'LOGOUT' });
          return;
        }

        const valid = await authService.validateSession().catch(() => true);
        if (!valid) {
          removeStoredUser();
          if (active) dispatch({ type: 'LOGOUT' });
          return;
        }

        const user: User = {
          id: session.user.id,
          name:
            session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url,
        };

        if (active) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          setStoredUser(user);
        }
      })
      .catch(() => {
        removeStoredUser();
        if (active) dispatch({ type: 'LOGOUT' });
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    const {
      data: { subscription },
    } = authService.onAuthStateChange((user) => {
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        setStoredUser(user);
      } else {
        dispatch({ type: 'LOGOUT' });
        removeStoredUser();
      }
      setIsInitializing(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = useCallback(async (_credentialResponse?: { credential: string }) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      if (!isSupabase) {
        throw new Error('Login local desativado. Use o Supabase Auth.');
      }

      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Erro ao processar login Google:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Erro ao autenticar com Google.' });
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'LOGOUT' });
    removeStoredUser();
    playSound('click');
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
    <AuthContext.Provider
      value={{ ...state, isInitializing, loginWithGoogle, logout, clearError }}
    >
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
