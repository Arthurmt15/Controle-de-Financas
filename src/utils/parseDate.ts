const WEEKDAY_MAP: Record<string, number> = {
  'domingo': 0, 'dom': 0, 'segunda': 1, 'seg': 1, 'segunda-feira': 1,
  'terça': 2, 'terca': 2, 'ter': 2, 'terça-feira': 2, 'terca-feira': 2,
  'quarta': 3, 'qua': 3, 'quarta-feira': 3, 'quinta': 4, 'qui': 4, 'quinta-feira': 4,
  'sexta': 5, 'sex': 5, 'sexta-feira': 5, 'sábado': 6, 'sabado': 6, 'sab': 6,
};
const MONTH_MAP: Record<string, number> = {
  'janeiro': 0, 'jan': 0, 'fevereiro': 1, 'fev': 1, 'março': 2, 'marco': 2, 'mar': 2,
  'abril': 3, 'abr': 3, 'maio': 4, 'mai': 4, 'junho': 5, 'jun': 5, 'julho': 6, 'jul': 6,
  'agosto': 7, 'ago': 7, 'setembro': 8, 'set': 8, 'outubro': 9, 'out': 9, 'novembro': 10, 'nov': 10, 'dezembro': 11, 'dez': 11,
};

/** Formata Date para YYYY-MM-DD */
export function formatDate(d: Date): string {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Extrai data relativa/absoluta do texto (hoje/ontem/dia da semana/DD/MM) e retorna texto limpo */
export function extractDate(text: string): { value: string; clean: string } | null {
  const lower = text.toLowerCase(); const today = new Date(); today.setHours(12, 0, 0, 0);
  const hojeMatch = lower.match(/\bhoje\b/i);
  if (hojeMatch) return { value: formatDate(today), clean: text.replace(hojeMatch[0], ' ').trim() };
  const ontemMatch = lower.match(/\bontem\b/i);
  if (ontemMatch) { const d = new Date(today); d.setDate(d.getDate() - 1); return { value: formatDate(d), clean: text.replace(ontemMatch[0], ' ').trim() }; }
  const anteontemMatch = lower.match(/\banteontem\b/i);
  if (anteontemMatch) { const d = new Date(today); d.setDate(d.getDate() - 2); return { value: formatDate(d), clean: text.replace(anteontemMatch[0], ' ').trim() }; }
  for (const [dayName, dayNum] of Object.entries(WEEKDAY_MAP)) {
    const regex = new RegExp(`\\b${dayName}\\b`, 'i'); const match = lower.match(regex);
    if (match) { const d = new Date(today); let diff = d.getDay() - dayNum; if (diff <= 0) diff += 7; d.setDate(d.getDate() - diff); return { value: formatDate(d), clean: text.replace(match[0], ' ').trim() }; }
  }
  const dmyPattern = /(?:dia\s+)?(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?/i;
  const dmyMatch = lower.match(dmyPattern);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]); const month = MONTH_MAP[dmyMatch[2]];
    if (month !== undefined) {
      let year = dmyMatch[3] ? parseInt(dmyMatch[3]) : today.getFullYear();
      const d = new Date(year, month, day, 12, 0, 0, 0);
      if (!dmyMatch[3] && d > today) d.setFullYear(d.getFullYear() - 1);
      return { value: formatDate(d), clean: text.replace(dmyMatch[0], ' ').trim() };
    }
  }
  const slashPattern = /(?:dia\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/i;
  const slashMatch = lower.match(slashPattern);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]); const month = parseInt(slashMatch[2]) - 1;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      let year = slashMatch[3] ? parseInt(slashMatch[3]) : today.getFullYear();
      const d = new Date(year, month, day, 12, 0, 0, 0);
      if (!slashMatch[3] && d > today) d.setFullYear(d.getFullYear() - 1);
      return { value: formatDate(d), clean: text.replace(slashMatch[0], ' ').trim() };
    }
  }
  return null;
}
