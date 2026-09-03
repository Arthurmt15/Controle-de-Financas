/**
 * @file hooks/useLocalStorage.ts
 * @description Hook customizado para gerenciar dados no localStorage com sincronização de estado.
 * Este hook permite persistir dados no localStorage e mantê-los sincronizados com o estado do React.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar dados no localStorage
 * @template T - Tipo do valor armazenado
 * @param {string} key - Chave do localStorage
 * @param {T} initialValue - Valor inicial caso não exista nada no localStorage
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} Array com valor, setter e remover
 *
 * @example
 * // Uso básico
 * const [name, setName, removeName] = useLocalStorage<string>('name', 'João');
 *
 * @example
 * // Uso com objeto
 * const [user, setUser, removeUser] = useLocalStorage<User>('user', defaultUser);
 *
 * @example
 * // Uso com array
 * const [transactions, setTransactions, removeTransactions] = useLocalStorage<Transaction[]>('transactions', []);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Tenta recuperar o valor do localStorage
      const item = window.localStorage.getItem(key);
      // Retorna o valor parseado ou o valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Em caso de erro, retorna o valor inicial
      console.error(`Erro ao ler localStorage para a chave "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Função para atualizar o valor no localStorage e no estado
   * @param {T | ((val: T) => T)} value - Novo valor ou função de atualização
   */
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Permite que o valor seja uma função (como useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Atualiza o estado
        setStoredValue(valueToStore);
        
        // Atualiza o localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Erro ao salvar no localStorage para a chave "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  /**
   * Função para remover o valor do localStorage
   */
  const removeValue = useCallback(() => {
    try {
      // Remove do localStorage
      window.localStorage.removeItem(key);
      // Reseta para o valor inicial
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Erro ao remover do localStorage para a chave "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincroniza com mudanças em outras abas/janelas
  useEffect(() => {
    /**
     * Handler para o evento de mudança no storage
     * @param {StorageEvent} e - Evento de storage
     */
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Erro ao sincronizar localStorage para a chave "${key}":`, error);
        }
      }
    };

    // Adiciona o listener
    window.addEventListener('storage', handleStorageChange);

    // Remove o listener ao desmontar
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
