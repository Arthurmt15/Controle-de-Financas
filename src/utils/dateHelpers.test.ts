/**
 * @file utils/dateHelpers.test.ts
 * @description Garante que datas DATE do banco ("YYYY-MM-DD") não deslizam
 * de dia/mês por causa do fuso (bug que quebrava Despesas por Categoria).
 */
import { toLocalDateTime, parseLocalDate } from './dateHelpers';

describe('dateHelpers - fuso horário', () => {
  it('toLocalDateTime ancora data DATE ao meio-dia local', () => {
    expect(toLocalDateTime('2026-10-07')).toBe('2026-10-07T12:00:00');
    expect(toLocalDateTime('2026-10-07T15:00:00.000Z')).toBe('2026-10-07T15:00:00.000Z');
  });

  it('data DATE cai no mês/dia certos em qualquer fuso', () => {
    const d = new Date(toLocalDateTime('2026-10-07'));
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(7);
    expect(d.getFullYear()).toBe(2026);
  });

  it('parseLocalDate interpreta YYYY-MM-DD como data local', () => {
    const d = parseLocalDate('2026-10-01');
    expect(d.getMonth()).toBe(9);
    expect(d.getDate()).toBe(1);
  });

  it('dia 1º não vaza para o mês anterior', () => {
    // new Date("2026-10-01") puro daria 30/09 no Brasil (UTC-3)
    const d = parseLocalDate('2026-10-01');
    expect(d.getMonth()).toBe(9);
  });
});
