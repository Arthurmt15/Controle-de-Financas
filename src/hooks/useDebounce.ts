/**
 * @file hooks/useDebounce.ts
 * @description Hook para debounce de valores e funções.
 * Útil para buscas e inputs que não devem disparar a cada tecla.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para debounce de valor
 * @param {T} value - Valor a ser "debounced"
 * @param {number} delay - Delay em milissegundos (padrão: 300)
 * @returns {T} Valor após o delay
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * // debouncedSearch atualiza 300ms após última digitação
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para debounce de função
 * @param {Function} fn - Função a ser "debounced"
 * @param {number} delay - Delay em milissegundos (padrão: 300)
 * @returns {Function} Função debounced
 *
 * @example
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   fetchResults(term);
 * }, 300);
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Função debounced que cancela execuções anteriores
   */
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      // Cancela timer anterior
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Cria novo timer
      timerRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}

export default useDebounce;
