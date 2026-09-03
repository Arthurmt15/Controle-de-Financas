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
export function convertToCSV(config: ExportConfig): string {
  const { transactions, categories } = config;

  // Cabeçalho do CSV
  const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Observações'];

  // Mapeia transações para linhas CSV
  const rows = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.categoryId);
    return [
      formatDate(t.date),
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'income' ? 'Entrada' : 'Saída',
      category?.name || 'Sem categoria',
      t.amount.toFixed(2),
      t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '',
    ].join(',');
  });

  // Junta cabeçalho e linhas
  return [headers.join(';'), ...rows].join('\n');
}

/**
 * Faz download de um arquivo CSV
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
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

  // Salva o PDF
  doc.save('relatorio_financeiro.pdf');
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
