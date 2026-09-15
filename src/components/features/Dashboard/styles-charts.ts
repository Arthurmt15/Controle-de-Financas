/**
 * @file components/features/Dashboard/styles-charts.ts
 * @description Legado removido — Charts/TransactionsList agora usam shadcn Card + tailwind.
 * Mantido para compatibilidade; todo visual migrou para tailwind em Charts.tsx e TransactionsList.tsx.
 * @deprecated Use shadcn Card. Será removido em versão futura.
 */

// Helpers tailwind (opcionais) — não usados diretamente, apenas para referência
export const chartsGridClass = 'grid grid-cols-1 gap-4';
export const panelClass = 'rounded-2xl border bg-card shadow-sm overflow-hidden';
export const panelHeaderClass = 'flex flex-row items-center justify-between py-4 px-5 border-b';
