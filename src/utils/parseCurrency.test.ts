import { parseCurrencyInput } from './parseCurrency';

describe('parseCurrencyInput', () => {
  it('parses a Brazilian decimal value', () => {
    expect(parseCurrencyInput('1.250,75')).toBe(1250.75);
  });

  it('parses a dot decimal value without turning cents into thousands', () => {
    expect(parseCurrencyInput('42.50')).toBe(42.5);
  });

  it('rejects an empty or invalid value', () => {
    expect(parseCurrencyInput('valor')).toBeNull();
  });

  it('rejects exponent, hexadecimal, and negative numeric payloads', () => {
    expect(parseCurrencyInput('1e6')).toBeNull();
    expect(parseCurrencyInput('0x10')).toBeNull();
    expect(parseCurrencyInput('-100')).toBeNull();
  });
});
