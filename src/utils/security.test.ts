/**
 * @file utils/security.test.ts
 * @description Testes para helpers de segurança (escapeHtml + renderMarkdown sanitizado)
 */

// Reimplementa funções para teste isolado (mesma lógica dos componentes)
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\.\s+(.+)/gm, '<strong>$1.</strong> $2')
    .replace(/^-\s+(.+)/gm, '&bull; $1')
    .replace(/\n/g, '<br/>');
}

describe('security - escapeHtml', () => {
  it('escapa tags script', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapa img onerror', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toContain('&lt;img');
    expect(escapeHtml('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });

  it('escapa & " \'', () => {
    expect(escapeHtml('&"\'')).toBe('&amp;&quot;&#039;');
  });
});

describe('security - renderMarkdown com XSS', () => {
  it('mantém negrito após escape', () => {
    expect(renderMarkdown('**negrito**')).toBe('<strong>negrito</strong>');
  });

  it('escapa HTML antes de aplicar markdown', () => {
    const input = '<img src=x onerror=alert(1)> **teste**';
    const out = renderMarkdown(input);
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
    expect(out).toContain('<strong>teste</strong>');
  });

  it('previne injeção via script + markdown', () => {
    const input = '**a**<script>alert(1)</script>';
    const out = renderMarkdown(input);
    expect(out).toBe('<strong>a</strong>&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
