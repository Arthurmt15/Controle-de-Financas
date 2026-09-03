/**
 * @file utils/validators.test.ts
 * @description Testes unitários para funções de validação.
 */

import {
  isValidEmail,
  validatePassword,
  isValidAmount,
  isNotEmpty,
  hasMinLength,
  hasMaxLength,
  validateDate,
  validateDateRange,
  validateTransactionForm,
  validateLoginForm,
} from './validators';

describe('Validators', () => {
  // ============================================
  // TESTES DE EMAIL
  // ============================================
  describe('isValidEmail', () => {
    it('deve retornar true para email válido', () => {
      expect(isValidEmail('usuario@exemplo.com')).toBe(true);
      expect(isValidEmail('test@gmail.com')).toBe(true);
      expect(isValidEmail('nome.sobrenome@empresa.com.br')).toBe(true);
    });

    it('deve retornar false para email inválido', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('email-invalido')).toBe(false);
      expect(isValidEmail('@exemplo.com')).toBe(false);
      expect(isValidEmail('usuario@')).toBe(false);
    });
  });

  // ============================================
  // TESTES DE SENHA
  // ============================================
  describe('validatePassword', () => {
    it('deve retornar null para senha válida', () => {
      expect(validatePassword('MinhaSenh@123')).toBe(null);
      expect(validatePassword('Abcdef1!')).toBe(null);
    });

    it('deve retornar erro para senha curta', () => {
      const result = validatePassword('123');
      expect(result).toBe('A senha deve ter pelo menos 8 caracteres');
    });

    it('deve retornar erro para senha sem maiúscula', () => {
      const result = validatePassword('minhasenh@123');
      expect(result).toBe('A senha deve conter pelo menos uma letra maiúscula');
    });

    it('deve retornar erro para senha sem minúscula', () => {
      const result = validatePassword('MINHASENH@123');
      expect(result).toBe('A senha deve conter pelo menos uma letra minúscula');
    });

    it('deve retornar erro para senha sem número', () => {
      const result = validatePassword('MinhaSenh@');
      expect(result).toBe('A senha deve conter pelo menos um número');
    });
  });

  // ============================================
  // TESTES DE VALOR
  // ============================================
  describe('isValidAmount', () => {
    it('deve retornar true para valor positivo', () => {
      expect(isValidAmount('150')).toBe(true);
      expect(isValidAmount('0.50')).toBe(true);
      expect(isValidAmount(100)).toBe(true);
    });

    it('deve retornar false para valor inválido', () => {
      expect(isValidAmount('-10')).toBe(false);
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('0')).toBe(false);
    });
  });

  // ============================================
  // TESTES DE STRINGS
  // ============================================
  describe('isNotEmpty', () => {
    it('deve retornar true para string não vazia', () => {
      expect(isNotEmpty('texto')).toBe(true);
      expect(isNotEmpty(' ')).toBe(false);
      expect(isNotEmpty('')).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('deve verificar comprimento mínimo', () => {
      expect(hasMinLength('abcde', 3)).toBe(true);
      expect(hasMinLength('ab', 3)).toBe(false);
    });
  });

  describe('hasMaxLength', () => {
    it('deve verificar comprimento máximo', () => {
      expect(hasMaxLength('abc', 5)).toBe(true);
      expect(hasMaxLength('abcdef', 5)).toBe(false);
    });
  });

  // ============================================
  // TESTES DE DATA
  // ============================================
  describe('validateDate', () => {
    it('deve retornar null para data válida', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      expect(validateDate(dateStr)).toBe(null);
    });

    it('deve retornar erro para data futura', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const dateStr = future.toISOString().split('T')[0];
      expect(validateDate(dateStr)).toBe('A data não pode ser no futuro');
    });
  });

  describe('validateDateRange', () => {
    it('deve retornar null para intervalo válido', () => {
      expect(validateDateRange('2026-01-01', '2026-12-31')).toBe(null);
    });

    it('deve retornar erro quando início > fim', () => {
      expect(validateDateRange('2026-12-31', '2026-01-01')).toBe(
        'A data de início deve ser anterior à data de fim'
      );
    });
  });

  // ============================================
  // TESTES DE FORMULÁRIO
  // ============================================
  describe('validateTransactionForm', () => {
    it('deve retornar vazio para dados válidos', () => {
      const errors = validateTransactionForm({
        description: 'Almoço',
        amount: '25.50',
        date: '2026-09-03',
        categoryId: '1',
      });
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('deve retornar erros para dados inválidos', () => {
      const errors = validateTransactionForm({
        description: '',
        amount: '-10',
        date: '2030-01-01',
        categoryId: '',
      });
      expect(errors.description).toBeDefined();
      expect(errors.amount).toBeDefined();
      expect(errors.date).toBeDefined();
      expect(errors.categoryId).toBeDefined();
    });
  });

  describe('validateLoginForm', () => {
    it('deve retornar vazio para credenciais válidas', () => {
      const errors = validateLoginForm({
        email: 'user@exemplo.com',
        password: '123456',
      });
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('deve retornar erros para credenciais inválidas', () => {
      const errors = validateLoginForm({
        email: 'invalido',
        password: '',
      });
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });
});
