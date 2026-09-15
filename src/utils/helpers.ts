/**
 * @file utils/helpers.ts
 * @description Re-exporta helpers splitados para manter <300 linhas.
 */
export * from './dateHelpers';
export * from './stringHelpers';

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, ms: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, curr) => {
    const k = String(curr[key]);
    if (!result[k]) result[k] = [];
    result[k].push(curr);
    return result;
  }, {} as Record<string, T[]>);
};
