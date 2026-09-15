export const CREATE_CATEGORY_PATTERNS = [
  /criar?\s+(?:uma\s+)?categori[ao]\s+(.+)/i,
  /nova\s+categori[ao]\s+(.+)/i,
  /adicionar?\s+categori[ao]\s+(.+)/i,
  /add\s+categori[ao]\s+(.+)/i,
  /criar?\s+(.+)/i,
];

export const DELETE_CATEGORY_PATTERNS = [
  /excluir?\s+categori[ao]\s+(.+)/i,
  /deletar?\s+categori[ao]\s+(.+)/i,
  /remover?\s+categori[ao]\s+(.+)/i,
  /apagar?\s+categori[ao]\s+(.+)/i,
];

export const SUMMARY_PATTERNS = [/\bresumo\b/i, /\bsaldo\b/i, /\bquanto\s+(?:tenho|ganho|gastei|sobrou)\b/i, /\bmeu\s+saldo\b/i, /\bcomo\s+(?:estou|está|esta)\b/i, /\bstatus\b/i];

export const ANALYSIS_PATTERNS = [/\banalis[eé]\b/i, /\banálise\b/i, /\bcomo\s+estão?\s+(?:meus|as)\s+gastos\b/i, /\bpara\s+onde\s+(?:vai|vai)\b/i, /\bmaiores?\s+gastos?\b/i, /\bquanto\s+gastei\b/i, /\bgastos\s+por\s+categori[ao]\b/i, /\bmeus\s+gastos\b/i, /\bcompar[ae]\b/i, /\btendência\b/i];

export const HELP_PATTERNS = [/\bajuda\b/i, /\bcomo\s+(?:usar|funciona)\b/i, /\bcomandos?\b/i, /\bhelp\b/i, /\bquais?\s+comandos?\b/i];

export const LIST_CATEGORIES_PATTERNS = [/\bcategorias?\b/i, /\bquais?\s+categorias?\b/i, /\blista\s+(?:de\s+)?categorias?\b/i];

export const CREATE_RECURRING_PATTERNS = [/(?:criar?|adicionar?|novo?)\s+(?:conta\s+)?recorrente\s+(.+)/i, /(?:conta\s+)?recorrente\s+(.+)/i, /(?:recorrente|fixo|fixa)\s+(.+)/i];

export const LIST_RECURRING_PATTERNS = [/\b(?:contas?\s+)?recorrentes?\b/i, /\bfixos?\b/i, /\bquais?\s+(?:contas?\s+)?fixas?\b/i];

export const UPDATE_RECURRING_PATTERNS = [/(?:editar?|atualizar?|alterar?)\s+(?:conta\s+)?recorrente\s+(.+)/i, /(?:mudar?|trocar?)\s+(?:conta\s+)?recorrente\s+(.+)/i];

export const DELETE_RECURRING_PATTERNS = [/(?:excluir?|deletar?|remover?|apagar?)\s+(?:conta\s+)?recorrente\s+(.+)/i];

export const GENERATE_BILLS_PATTERNS = [/\bgerar?\s+contas?\b/i, /\bcriar?\s+transações?\s+(?:das\s+)?contas?\b/i, /\bprocessar?\s+contas?\b/i];
