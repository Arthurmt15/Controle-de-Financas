/**
 * Converts values typed in either Brazilian (1.250,75) or dot-decimal
 * (42.50) notation without silently changing the monetary amount.
 */
export function parseCurrencyInput(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '');
  if (!normalized) return null;

  const hasComma = normalized.includes(',');
  const numeric = hasComma ? normalized.replace(/\./g, '').replace(',', '.') : normalized;
  const amount = Number(numeric);

  return Number.isFinite(amount) ? amount : null;
}
