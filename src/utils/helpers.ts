/**
 * @file utils/helpers.ts
 * @description Funções auxiliares utilitárias para o projeto.
 * Este arquivo contém funções helper genéricas usadas em diversas partes da aplicação.
 */

/**
 * Gera um ID único baseado em timestamp e número aleatório
 * @returns {string} ID único
 *
 * @example
 * // Retorna "1693737600000-a7b3c9d2"
 * generateId()
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Atrasa a execução de uma função (debounce helper)
 * @param {Function} fn - Função a ser executada após o delay
 * @param {number} ms - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce aplicado
 *
 * @example
 * const debouncedSearch = debounce((term) => searchAPI(term), 300);
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

/**
 * Agrupa um array de objetos por uma chave específica
 * @param {T[]} array - Array a ser agrupado
 * @param {keyof T} key - Chave para agrupamento
 * @returns {Record<string, T[]>} Objeto com os grupos
 *
 * @example
 * const grouped = groupBy(transactions, 'type');
 * // { income: [...], expense: [...] }
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, currentItem) => {
    const groupKey = String(currentItem[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentItem);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param {string | Date} date1 - Primeira data
 * @param {string | Date} date2 - Segunda data
 * @returns {number} Diferença em dias (positivo se date1 > date2)
 *
 * @example
 * // Retorna 30
 * daysDifference('2026-10-03', '2026-09-03')
 */
export const daysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Obtém o início do mês (primeiro dia)
 * @param {Date} date - Data de referência
 * @returns {Date} Primeiro dia do mês
 *
 * @example
 * // Retorna Date(2026, 8, 1) (1 de setembro de 2026)
 * getStartOfMonth(new Date(2026, 8, 15))
 */
export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtém o fim do mês (último dia)
 * @param {Date} date - Data de referência
 * @returns {Date} Último dia do mês
 *
 * @example
 * // Retorna Date(2026, 8, 30) (30 de setembro de 2026)
 * getEndOfMonth(new Date(2026, 8, 15))
 */
export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Verifica se uma data é hoje
 * @param {string | Date} date - Data a ser verificada
 * @returns {boolean} True se for hoje
 *
 * @example
 * // Retorna true (se executado em 03/09/2026)
 * isToday('2026-09-03')
 */
export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Verifica se uma data é deste mês
 * @param {string | Date} date - Data a ser verificada
 * @returns {boolean} True se for deste mês
 *
 * @example
 * // Retorna true (se executado em setembro de 2026)
 * isThisMonth('2026-09-15')
 */
export const isThisMonth = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Verifica se uma data é deste ano
 * @param {string | Date} date - Data a ser verificada
 * @returns {boolean} True se for deste ano
 *
 * @example
 * // Retorna true (se executado em 2026)
 * isThisYear('2026-09-03')
 */
export const isThisYear = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);

  return checkDate.getFullYear() === today.getFullYear();
};

/**
 * Obtém os últimos N meses
 * @param {number} count - Quantidade de meses
 * @returns {Array<{ month: number; year: number; name: string }>}
 *
 * @example
 * // Retorna os últimos 3 meses
 * getLastNMonths(3)
 */
export const getLastNMonths = (
  count: number
): Array<{ month: number; year: number; name: string }> => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const result = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      name: months[date.getMonth()],
    });
  }

  return result;
};

/**
 * Limita um número entre um mínimo e máximo
 * @param {number} value - Valor a ser limitado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor limitado
 *
 * @example
 * // Retorna 100
 * clamp(150, 0, 100)
 *
 * @example
 * // Retorna 0
 * clamp(-10, 0, 100)
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Converte um valor para positivo
 * @param {number} value - Valor a ser convertido
 * @returns {number} Valor positivo
 *
 * @example
 * // Retorna 50
 * toPositive(-50)
 */
export const toPositive = (value: number): number => {
  return Math.abs(value);
};

/**
 * Verifica se um valor é par
 * @param {number} value - Valor a ser verificado
 * @returns {boolean} True se for par
 *
 * @example
 * // Retorna true
 * isEven(4)
 *
 * @example
 * // Retorna false
 * isEven(3)
 */
export const isEven = (value: number): boolean => {
  return value % 2 === 0;
};

/**
 * Capitaliza a primeira letra de cada palavra
 * @param {string} text - Texto a ser processado
 * @returns {string} Texto com primeira letra de cada palavra maiúscula
 *
 * @example
 * // Retorna "João Da Silva"
 * capitalizeWords('joão da silva')
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Remove acentos de uma string
 * @param {string} text - Texto com acentos
 * @returns {string} Texto sem acentos
 *
 * @example
 * // Retorna "Alimentacao"
 * removeAccents('Alimentação')
 */
export const removeAccents = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Cria um objeto de delay para simular carregamento
 * @param {number} ms - Tempo de espera em milissegundos
 * @returns {Promise<void>}
 *
 * @example
 * // Espera 1 segundo
 * await delay(1000);
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
