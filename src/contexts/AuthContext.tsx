/**
 * @file contexts/AuthContext.tsx
 * @description Contexto de autenticação com Google OAuth.
 * Utiliza @react-oauth/google para autenticação segura via Google.
 */

import React, { createContext, useContext, useCallback, useEffect, useState, useReducer } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { User, AuthState, AuthAction } from '../types';

/**
 * Interface para payload do Google JWT decodificado
 */
interface GooglePayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

/**
 * Decodifica um token JWT do Google
 * @param {string} token - Token JWT do Google
 * @returns {GooglePayload} Payload decodificado com dados do usuário
 *
 * @example
 * const payload = decodeGoogleToken(credentialResponse.credential);
 * console.log(payload.name); // "Arthur Oliveira"
 */
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

/** Estado inicial da autenticação */
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
};

/**
 * Reducer para gerenciar ações de autenticação
 * @param {AuthState} state - Estado atual
 * @param {AuthAction} action - Ação a ser executada
 * @returns {AuthState} Novo estado
 */
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

/** Interface do contexto de autenticação */
interface AuthContextType extends AuthState {
  loginWithGoogle: (credentialResponse: { credential: string }) => void;
  logout: () => void;
  clearError: () => void;
}

/** Contexto de autenticação */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticação
 * @param {object} props - Props do provider
 * @param {React.ReactNode} props.children - Componentes filhos
 */
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

  // Sincroniza com localStorage ao inicializar
  useEffect(() => {
    if (storedUser) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: storedUser });
    }
  }, []);

  /**
   * Realiza o login com Google OAuth
   * Decodifica o token JWT e extrai dados do usuário
   * @param {object} credentialResponse - Resposta do Google com credential
   */
  const loginWithGoogle = useCallback(
    (credentialResponse: { credential: string }) => {
      try {
        dispatch({ type: 'LOGIN_START' });
        const payload = decodeGoogleToken(credentialResponse.credential);
        const user: User = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        setStoredUser(user);
      } catch (error) {
        console.error('Erro ao processar login Google:', error);
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Erro ao autenticar com Google.' });
      }
    },
    [setStoredUser]
  );

  /** Realiza o logout e limpa dados da sessão */
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    removeStoredUser();
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, [removeStoredUser]);

  /** Limpa mensagem de erro */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, loginWithGoogle, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar contexto de autenticação
 * @returns {AuthContextType} Valores e funções de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

/** Declaração de tipo para Google Identity Services */
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, config: object) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export default AuthContext;
