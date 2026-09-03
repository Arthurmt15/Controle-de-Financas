/**
 * @file utils/formatters.test.ts
 * @description Testes unitários para funções de formatação.
 */

import {
  formatCurrency,
  formatDate,
  toInputDate,
  formatNumber,
  truncateText,
  capitalizeFirstLetter,
  getMonthName,
  getMonthAbbreviation,
} from './formatters';

describe('Formatters', () => {
  // ============================================
  // TESTES DE MOEDA
  // ============================================
  describe('formatCurrency', () => {
    it('deve formatar valor como moeda brasileira', () => {
      expect(formatCurrency(1500)).toBe('R$ 1.500,00');
      expect(formatCurrency(250.5)).toBe('R$ 250,50');
      expect(formatCurrency(-100)).toBe('-R$ 100,00');
    });

    it('deve formatar valor zero', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });
  });

  // ============================================
  // TESTES DE DATA
  // ============================================
  describe('formatDate', () => {
    it('deve formatar data no padrão brasileiro', () => {
      expect(formatDate('2026-09-03')).toBe('03/09/2026');
    });

    it('deve formatar data com hora', () => {
      const result = formatDate('2026-09-03T14:30:00', true);
      expect(result).toContain('03/09/2026');
      expect(result).toContain('14:30');
    });
  });

  describe('toInputDate', () => {
    it('deve converter Date para formato de input', () => {
      const date = new Date(2026, 8, 3); // Setembro = 8
      expect(toInputDate(date)).toBe('2026-09-03');
    });
  });

  // ============================================
  // TESTES DE NÚMERO
  // ============================================
  describe('formatNumber', () => {
    it('deve formatar número com separadores', () => {
      expect(formatNumber(1500)).toBe('1.500,00');
      expect(formatNumber(1500.5, 1)).toBe('1.500,5');
    });
  });

  // ============================================
  // TESTES DE TEXTO
  // ============================================
  describe('truncateText', () => {
    it('deve truncar texto longo', () => {
      expect(truncateText('Texto muito longo para testar', 10)).toBe('Texto mui...');
    });

    it('deve retornar texto original se curto', () => {
      expect(truncateText('Curto', 10)).toBe('Curto');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('deve capitalizar primeira letra', () => {
      expect(capitalizeFirstLetter('alimentação')).toBe('Alimentação');
      expect(capitalizeFirstLetter('TRANSPORTE')).toBe('Transporte');
    });
  });

  // ============================================
  // TESTES DE MÊS
  // ============================================
  describe('getMonthName', () => {
    it('deve retornar nome do mês', () => {
      expect(getMonthName(0)).toBe('Janeiro');
      expect(getMonthName(8)).toBe('Setembro');
      expect(getMonthName(11)).toBe('Dezembro');
    });
  });

  describe('getMonthAbbreviation', () => {
    it('deve retornar abreviação do mês', () => {
      expect(getMonthAbbreviation(0)).toBe('Jan');
      expect(getMonthAbbreviation(8)).toBe('Set');
      expect(getMonthAbbreviation(11)).toBe('Dez');
    });
  });
});
