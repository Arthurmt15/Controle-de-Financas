/**
 * @file utils/validators.ts
 * @description Funções de validação de dados para formulários.
 * Este arquivo contém utilitários para validar inputs do usuário.
 */

/**
 * Valida se um email tem formato válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se o email for válido
 *
 * @example
 * // Retorna true
 * isValidEmail('usuario@exemplo.com')
 *
 * @example
 * // Retorna false
 * isValidEmail('email-invalido')
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se uma senha atende aos requisitos mínimos
 * @param {string} password - Senha a ser validada
 * @returns {string | null} Mensagem de erro ou null se válida
 *
 * @example
 * // Retorna null (válida)
 * validatePassword('MinhaSenh@123')
 *
 * @example
 * // Retorna "A senha deve ter pelo menos 8 caracteres"
 * validatePassword('123')
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra maiúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'A senha deve conter pelo menos um número';
  }
  return null;
};

/**
 * Valida se um valor é um número positivo
 * @param {string | number} value - Valor a ser validado
 * @returns {boolean} True se for um número positivo
 *
 * @example
 * // Retorna true
 * isValidAmount('150.50')
 *
 * @example
 * // Retorna false
 * isValidAmount('-10')
 */
export const isValidAmount = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Valida se uma string não está vazia
 * @param {string} value - String a ser validada
 * @returns {boolean} True se não estiver vazia
 *
 * @example
 * // Retorna true
 * isNotEmpty('Texto')
 *
 * @example
 * // Retorna false
 * isNotEmpty('')
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida se uma string tem comprimento mínimo
 * @param {string} value - String a ser validada
 * @param {number} minLength - Comprimento mínimo
 * @returns {boolean} True se tiver o comprimento mínimo
 *
 * @example
 * // Retorna true
 * hasMinLength('abcde', 3)
 *
 * @example
 * // Retorna false
 * hasMinLength('ab', 3)
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Valida se uma string tem comprimento máximo
 * @param {string} value - String a ser validada
 * @param {number} maxLength - Comprimento máximo
 * @returns {boolean} True se não ultrapassar o comprimento máximo
 *
 * @example
 * // Retorna true
 * hasMaxLength('abc', 5)
 *
 * @example
 * // Retorna false
 * hasMaxLength('abcdef', 5)
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Valida se uma data é válida e não está no futuro
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string | null} Mensagem de erro ou null se válida
 *
 * @example
 * // Retorna null (válida)
 * validateDate('2026-09-03')
 *
 * @example
 * // Retorna "A data não pode ser no futuro"
 * validateDate('2030-01-01')
 */
export const validateDate = (dateString: string): string | null => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  if (date > today) {
    return 'A data não pode ser no futuro';
  }

  return null;
};

/**
 * Valida se uma data de início é anterior à data de fim
 * @param {string} startDate - Data de início
 * @param {string} endDate - Data de fim
 * @returns {string | null} Mensagem de erro ou null se válido
 *
 * @example
 * // Retorna null (válido)
 * validateDateRange('2026-01-01', '2026-12-31')
 *
 * @example
 * // Retorna "A data de início deve ser anterior à data de fim"
 * validateDateRange('2026-12-31', '2026-01-01')
 */
export const validateDateRange = (startDate: string, endDate: string): string | null => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return 'A data de início deve ser anterior à data de fim';
  }

  return null;
};

/**
 * Valida um formulário de transação
 * @param {object} data - Dados da transação
 * @returns {object} Objeto com erros (vazio se válido)
 *
 * @example
 * // Retorna {}
 * validateTransactionForm({ description: 'Almoço', amount: '25.50', date: '2026-09-03', categoryId: '1' })
 *
 * @example
 * // Retorna { description: 'Descrição é obrigatória', amount: 'Valor inválido' }
 * validateTransactionForm({ description: '', amount: '-10', date: '2026-09-03', categoryId: '1' })
 */
export const validateTransactionForm = (data: {
  description: string;
  amount: string;
  date: string;
  categoryId: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(data.description)) {
    errors.description = 'Descrição é obrigatória';
  } else if (!hasMinLength(data.description, 3)) {
    errors.description = 'Descrição deve ter pelo menos 3 caracteres';
  } else if (!hasMaxLength(data.description, 100)) {
    errors.description = 'Descrição deve ter no máximo 100 caracteres';
  }

  if (!isValidAmount(data.amount)) {
    errors.amount = 'Valor deve ser um número positivo';
  }

  const dateError = validateDate(data.date);
  if (dateError) {
    errors.date = dateError;
  }

  if (!isNotEmpty(data.categoryId)) {
    errors.categoryId = 'Categoria é obrigatória';
  }

  return errors;
};

/**
 * Valida um formulário de login
 * @param {object} data - Dados de login
 * @returns {object} Objeto com erros (vazio se válido)
 *
 * @example
 * // Retorna {}
 * validateLoginForm({ email: 'user@exemplo.com', password: 'Senha123' })
 *
 * @example
 * // Retorna { email: 'Email inválido' }
 * validateLoginForm({ email: 'invalido', password: 'Senha123' })
 */
export const validateLoginForm = (data: {
  email: string;
  password: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(data.email)) {
    errors.email = 'Email é obrigatório';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  if (!isNotEmpty(data.password)) {
    errors.password = 'Senha é obrigatória';
  }

  return errors;
};
