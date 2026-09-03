/**
 * @file utils/helpers.test.ts
 * @description Testes unitários para funções auxiliares.
 */

import {
  generateId,
  daysDifference,
  getStartOfMonth,
  getEndOfMonth,
  isToday,
  isThisMonth,
  isThisYear,
  getLastNMonths,
  clamp,
  toPositive,
  isEven,
  capitalizeWords,
  removeAccents,
  groupBy,
} from './helpers';

describe('Helpers', () => {
  // ============================================
  // TESTES DE ID
  // ============================================
  describe('generateId', () => {
    it('deve gerar um ID único', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  // ============================================
  // TESTES DE DATA
  // ============================================
  describe('daysDifference', () => {
    it('deve calcular diferença entre datas', () => {
      expect(daysDifference('2026-10-03', '2026-09-03')).toBe(30);
      expect(daysDifference('2026-09-03', '2026-09-03')).toBe(0);
    });
  });

  describe('getStartOfMonth', () => {
    it('deve retornar primeiro dia do mês', () => {
      const date = new Date(2026, 8, 15);
      const result = getStartOfMonth(date);
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(8);
    });
  });

  describe('getEndOfMonth', () => {
    it('deve retornar último dia do mês', () => {
      const date = new Date(2026, 8, 15);
      const result = getEndOfMonth(date);
      expect(result.getDate()).toBe(30); // Setembro tem 30 dias
      expect(result.getMonth()).toBe(8);
    });
  });

  describe('isToday', () => {
    it('deve retornar true para hoje', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('deve retornar false para outra data', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });
  });

  describe('isThisMonth', () => {
    it('deve retornar true para mês atual', () => {
      expect(isThisMonth(new Date())).toBe(true);
    });
  });

  describe('isThisYear', () => {
    it('deve retornar true para ano atual', () => {
      expect(isThisYear(new Date())).toBe(true);
    });
  });

  describe('getLastNMonths', () => {
    it('deve retornar últimos N meses', () => {
      const months = getLastNMonths(3);
      expect(months).toHaveLength(3);
      expect(months[0]).toHaveProperty('month');
      expect(months[0]).toHaveProperty('year');
      expect(months[0]).toHaveProperty('name');
    });
  });

  // ============================================
  // TESTES NUMÉRICOS
  // ============================================
  describe('clamp', () => {
    it('deve limitar valor entre min e max', () => {
      expect(clamp(150, 0, 100)).toBe(100);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(50, 0, 100)).toBe(50);
    });
  });

  describe('toPositive', () => {
    it('deve converter para positivo', () => {
      expect(toPositive(-50)).toBe(50);
      expect(toPositive(50)).toBe(50);
    });
  });

  describe('isEven', () => {
    it('deve verificar se número é par', () => {
      expect(isEven(4)).toBe(true);
      expect(isEven(3)).toBe(false);
      expect(isEven(0)).toBe(true);
    });
  });

  // ============================================
  // TESTES DE TEXTO
  // ============================================
  describe('capitalizeWords', () => {
    it('deve capitalizar primeira letra de cada palavra', () => {
      expect(capitalizeWords('joão da silva')).toBe('João Da Silva');
    });
  });

  describe('removeAccents', () => {
    it('deve remover acentos', () => {
      expect(removeAccents('Alimentação')).toBe('Alimentacao');
      expect(removeAccents('São Paulo')).toBe('Sao Paulo');
    });
  });

  // ============================================
  // TESTES DE AGRUPAMENTO
  // ============================================
  describe('groupBy', () => {
    it('deve agrupar array por chave', () => {
      const data = [
        { id: 1, type: 'income' },
        { id: 2, type: 'expense' },
        { id: 3, type: 'income' },
      ];
      const grouped = groupBy(data, 'type');
      expect(grouped.income).toHaveLength(2);
      expect(grouped.expense).toHaveLength(1);
    });
  });
});
