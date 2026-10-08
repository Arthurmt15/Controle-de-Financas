/**
 * @file utils/exportData.ts
 * @description Funções para exportação de dados em CSV e PDF.
 * Gera arquivos formatados a partir das transações financeiras.
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';
import type { Transaction, Category } from '../types';

/**
 * Interface para configuração de exportação
 */
interface ExportConfig {
  transactions: Transaction[];
  categories: Category[];
  startDate?: string;
  endDate?: string;
}

/**
 * Converte transações para formato CSV
 * @param {ExportConfig} config - Configuração com transações e categorias
 * @returns {string} Conteúdo CSV formatado
 *
 * @example
 * const csv = convertToCSV({ transactions, categories });
 * downloadCSV(csv, 'transacoes.csv');
 */
/**
 * Escapa valor para CSV e previne CSV Injection (OWASP).
 * Prefixa com ' se começar com = + - @ e escapa aspas.
 */
function escapeCsvField(value: string): string {
  let v = value;
  if (/^[=+\-@\t\r]/.test(v)) {
    v = `'${v}`;
  }
  if (v.includes('"') || v.includes(';') || v.includes('\n') || v.includes(',')) {
    v = `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function convertToCSV(config: ExportConfig): string {
  const { transactions, categories } = config;

  // Cabeçalho do CSV — separador ; para compatibilidade pt-BR Excel
  const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Observações'];

  // Mapeia transações para linhas CSV
  const rows = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.categoryId);
    return [
      escapeCsvField(formatDate(t.date)),
      escapeCsvField(t.description),
      escapeCsvField(t.type === 'income' ? 'Entrada' : 'Saída'),
      escapeCsvField(category?.name || 'Sem categoria'),
      escapeCsvField(t.amount.toFixed(2)),
      escapeCsvField(t.notes || ''),
    ].join(';');
  });

  // Junta cabeçalho e linhas
  return [headers.join(';'), ...rows].join('\n');
}

/**
 * Faz download de um arquivo CSV (usa menu nativo de compartilhar no celular).
 * @param {string} csvContent - Conteúdo CSV
 * @param {string} filename - Nome do arquivo
 *
 * @example
 * downloadCSV(csvContent, 'transacoes_2026.csv');
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Adiciona BOM para caracteres especiais no Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  shareOrDownloadFile(blob, filename);
}

/**
 * Faz download tradicional via âncora temporária (desktop e fallback mobile).
 */
function anchorDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoga com atraso para não interromper o download em alguns browsers
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Compartilha o arquivo via Web Share API (menu nativo do celular) quando
 * disponível; senão faz download tradicional. Ideal para o botão mobile.
 */
export function shareOrDownloadFile(blob: Blob, filename: string): void {
  try {
    const nav = navigator as Navigator & {
      canShare?: (data: { files: File[] }) => boolean;
      share?: (data: { files: File[]; title?: string }) => Promise<void>;
    };
    const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
    if (typeof nav.canShare === 'function' && typeof nav.share === 'function') {
      try {
        if (nav.canShare({ files: [file] })) {
          const url = URL.createObjectURL(blob);
          nav
            .share({ files: [file], title: filename })
            .catch((err: unknown) => {
              // Cancelamento pelo usuário não deve disparar download
              if ((err as Error)?.name !== 'AbortError') anchorDownload(url, filename);
              else URL.revokeObjectURL(url);
            });
          return;
        }
      } catch {
        // canShare/share falhou de forma síncrona — cai para download tradicional
      }
    }
  } catch {
    // File/Blob indisponível — cai para download tradicional
  }
  anchorDownload(URL.createObjectURL(blob), filename);
}

/**
 * Gera relatório PDF com as transações
 * @param {ExportConfig} config - Configuração com transações e categorias
 *
 * @example
 * generatePDF({ transactions, categories });
 */
export function generatePDF(config: ExportConfig): void {
  const { transactions, categories } = config;
  const doc = new jsPDF();

  // Título do documento
  doc.setFontSize(18);
  doc.text('Relatório Financeiro', 14, 22);

  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${formatDate(new Date().toISOString(), true)}`, 14, 30);

  // Calcula totais
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Resumo
  doc.setFontSize(12);
  doc.text('Resumo:', 14, 42);
  doc.setFontSize(10);
  doc.text(`Total Entradas: ${formatCurrency(totalIncome)}`, 14, 50);
  doc.text(`Total Saídas: ${formatCurrency(totalExpense)}`, 14, 56);
  doc.text(`Saldo: ${formatCurrency(balance)}`, 14, 62);

  // Prepara dados para a tabela
  const tableData = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.categoryId);
    return [
      formatDate(t.date),
      t.description,
      t.type === 'income' ? 'Entrada' : 'Saída',
      category?.name || '-',
      formatCurrency(t.amount),
    ];
  });

  // Adiciona tabela
  (doc as any).autoTable({
    startY: 72,
    head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Salva o PDF (menu nativo de compartilhar no celular, download no desktop)
  const filename = 'relatorio_financeiro.pdf';
  try {
    const pdfBlob = doc.output('blob') as Blob;
    const blob =
      pdfBlob instanceof Blob
        ? new Blob([pdfBlob], { type: 'application/pdf' })
        : pdfBlob;
    shareOrDownloadFile(blob, filename);
  } catch {
    doc.save(filename);
  }
}

/**
 * Exporta transações filtradas como CSV
 * @param {ExportConfig} config - Configuração de exportação
 *
 * @example
 * exportTransactionsCSV({ transactions, categories, startDate: '2026-01-01' });
 */
export function exportTransactionsCSV(config: ExportConfig): void {
  const csv = convertToCSV(config);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `transacoes_${date}.csv`);
}

/**
 * Exporta transações filtradas como PDF
 * @param {ExportConfig} config - Configuração de exportação
 *
 * @example
 * exportTransactionsPDF({ transactions, categories });
 */
export function exportTransactionsPDF(config: ExportConfig): void {
  generatePDF(config);
}
