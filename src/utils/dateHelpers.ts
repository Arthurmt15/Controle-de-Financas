/** Calcula diferença em dias entre duas datas (ceil) */
export const daysDifference = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
};
/** Retorna o primeiro dia do mês da data */
export const getStartOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);
/** Retorna o último dia do mês da data */
export const getEndOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);
/** Verifica se a data é hoje */
export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const c = new Date(date);
  return (
    c.getDate() === today.getDate() &&
    c.getMonth() === today.getMonth() &&
    c.getFullYear() === today.getFullYear()
  );
};
/** Verifica se a data é do mês atual */
export const isThisMonth = (date: string | Date): boolean => {
  const today = new Date();
  const c = new Date(date);
  return c.getMonth() === today.getMonth() && c.getFullYear() === today.getFullYear();
};
/** Verifica se a data é do ano atual */
export const isThisYear = (date: string | Date): boolean =>
  new Date(date).getFullYear() === new Date().getFullYear();
/** Retorna os últimos N meses (útil para gráficos) */
export const getLastNMonths = (
  count: number
): Array<{ month: number; year: number; name: string }> => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const result = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ month: d.getMonth(), year: d.getFullYear(), name: months[d.getMonth()] });
  }
  return result;
};
/** Retorna todos os meses do ano atual */
export const getCurrentYearMonths = (): Array<{ month: number; year: number; name: string }> => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const y = new Date().getFullYear();
  return months.map((name, month) => ({ month, year: y, name }));
};

/**
 * Normaliza data vinda do banco para ISO local com hora (meio-dia).
 * A coluna transactions.date é DATE: o Supabase devolve "2026-10-07" e
 * `new Date("2026-10-07")` interpreta como UTC — no Brasil isso cai no dia
 * anterior (e no mês anterior, se dia 1º), quebrando filtros mensais e gráficos.
 * Com "T12:00:00" (horário local), getMonth/getDate sempre acertam.
 */
export function toLocalDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return `${value.trim()}T12:00:00`;
  return value;
}

/**
 * Interpreta "YYYY-MM-DD" como data local (meio-dia), evitando o deslocamento
 * de fuso que `new Date("2026-10-07")` causa. Repassa outros formatos direto.
 */
export function parseLocalDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
    const [y, m, d] = value.trim().slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  return new Date(value);
}
