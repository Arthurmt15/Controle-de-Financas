/** Capitaliza cada palavra (ex: "joão silva" -> "João Silva") */
export const capitalizeWords = (text: string): string =>
  text
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
/** Remove acentos (NFD) para comparação sem acento */
export const removeAccents = (text: string): string =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/** Limita valor entre min e max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
/** Converte para valor absoluto */
export const toPositive = (value: number): number => Math.abs(value);
/** Verifica se é par */
export const isEven = (value: number): boolean => value % 2 === 0;
/** Delay assíncrono (simula loading) */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
