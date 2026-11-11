/**
 * @file utils/security.test.ts
 * @description Testes de regressão para renderização segura de mensagens.
 */

import { renderSafeMarkdown } from './safeMarkdown';

describe('security - renderSafeMarkdown', () => {
  it('escapa tags script', () => {
    expect(renderSafeMarkdown('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapa img onerror', () => {
    expect(renderSafeMarkdown('<img src=x onerror=alert(1)>')).toContain('&lt;img');
    expect(renderSafeMarkdown('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });

  it('escapa HTML antes de aplicar markdown', () => {
    const input = '<img src=x onerror=alert(1)> **teste**';
    const out = renderSafeMarkdown(input);
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
    expect(out).toContain('<strong>teste</strong>');
  });

  it('previne injeção via script + markdown', () => {
    const input = '**a**<script>alert(1)</script>';
    const out = renderSafeMarkdown(input);
    expect(out).toBe('<strong>a</strong>&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
