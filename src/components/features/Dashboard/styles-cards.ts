/**
 * @file components/features/Dashboard/styles-cards.ts
 * @description Legado removido — SummaryCards agora usa shadcn Card + tailwind.
 * Exporta helpers de classe/tokens para manter compatibilidade.
 * @deprecated Migrado para tailwind em SummaryCards.tsx
 */

export const summaryGridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5';
export const stripeByTone: Record<string, string> = {
  emerald: 'linear-gradient(180deg,#10b981,#06b6d4)',
  rose: 'linear-gradient(180deg,#f43f5e,#f97316)',
  violet: 'linear-gradient(180deg,#8b5cf6,#6366f1)',
  slate: 'linear-gradient(180deg,#64748b,#475569)',
};
export const iconToneClass: Record<string, string> = {
  emerald:
    'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent',
  rose: 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-transparent',
  violet:
    'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent',
  slate: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent',
};
