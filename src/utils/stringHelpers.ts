export const capitalizeWords = (text: string): string => text.toLowerCase().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
export const removeAccents = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
export const toPositive = (value: number): number => Math.abs(value);
export const isEven = (value: number): boolean => value % 2 === 0;
export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
