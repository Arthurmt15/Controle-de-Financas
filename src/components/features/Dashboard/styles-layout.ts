/**
 * @file components/features/Dashboard/styles-layout.ts
 * @description Legado removido — layout agora é tailwind puro em Dashboard/index.tsx.
 * Mantido apenas para compatibilidade de import; prefira classes tailwind/shadcn.
 * @deprecated Use tailwind classes diretamente. Será removido em versão futura.
 */

// Container bento do dashboard (equivalente tailwind)
export const containerClass = 'w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6';
export const headingClass = 'flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5';
export const headingTitleClass =
  'text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent';
export const headingMetaClass =
  'inline-flex items-center gap-2 text-xs font-medium text-muted-foreground px-3 py-2 rounded-full border bg-card shadow-sm whitespace-nowrap';
