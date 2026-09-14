/**
 * @file utils/installmentDetector.ts
 * @description Utilitário para detectar transações parceladas automaticamente.
 * Analisa descrições de transações do Open Finance para identificar parcelas.
 */

import type { OpenFinanceTransaction } from '../types/openFinance';
import type { Installment } from '../types';

/** Padrões de descrição que indicam transação parcelada */
const INSTALLMENT_PATTERNS = [
  /(\d{1,2})\s*\/\s*(\d{1,2})\s*x/i,           // "1/12x" ou "1 / 12 x"
  /parcela\s*(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})/i, // "parcela 1 de 12"
  /(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})\s*parcel/i,  // "1 de 12 parcelas"
  /(\d{1,2})\s*\/\s*(\d{1,2})\s*parcel/i,          // "1/12 parcelas"
];

/** Resultado da detecção de parcela */
interface DetectedInstallment {
  description: string;
  amount: number;
  currentInstallment: number;
  totalInstallments: number;
  date: string;
  originalTransaction: OpenFinanceTransaction;
}

/**
 * Analisa a descrição de uma transação para detectar padrão de parcelamento.
 * @param description Descrição da transação
 * @returns Objeto com parcela atual e total, ou null se não detectado
 */
function parseInstallmentDescription(description: string): {
  current: number;
  total: number;
} | null {
  for (const pattern of INSTALLMENT_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      const current = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      if (current > 0 && total > 0 && current <= total) {
        return { current, total };
      }
    }
  }
  return null;
}

/**
 * Detecta transações que são parcelas de compras parceladas.
 * Agrupa transações com a mesma descrição base e identifica padrão de parcelamento.
 * @param transactions Lista de transações do Open Finance
 * @returns Lista de parcelados detectados
 */
export function detectInstallments(
  transactions: OpenFinanceTransaction[]
): DetectedInstallment[] {
  const detected: DetectedInstallment[] = [];
  const processed = new Set<string>();

  for (const tx of transactions) {
    // Pula se já foi processada ou se é crédito (entrada)
    if (processed.has(tx.id) || tx.amount >= 0) continue;

    const result = parseInstallmentDescription(tx.description);
    if (!result) continue;

    // Extrai nome base removendo o padrão de parcelamento
    const baseName = tx.description
      .replace(/\d{1,2}\s*\/\s*\d{1,2}\s*x/i, '')
      .replace(/parcela\s*\d{1,2}\s*(?:de|\/)\s*\d{1,2}/i, '')
      .replace(/\d{1,2}\s*(?:de|\/)\s*\d{1,2}\s*parcel/i, '')
      .replace(/\d{1,2}\s*\/\s*\d{1,2}\s*parcel/i, '')
      .trim();

    if (!baseName) continue;

    // Verifica se já existe um parcelado para esta descrição base
    const existingIndex = detected.findIndex(
      (d) => d.description.toLowerCase() === baseName.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Atualiza se esta parcela for maior
      if (result.current > detected[existingIndex].currentInstallment) {
        detected[existingIndex].currentInstallment = result.current;
        detected[existingIndex].totalInstallments = Math.max(
          detected[existingIndex].totalInstallments,
          result.total
        );
      }
    } else {
      detected.push({
        description: baseName,
        amount: Math.abs(tx.amount),
        currentInstallment: result.current,
        totalInstallments: result.total,
        date: tx.date,
        originalTransaction: tx,
      });
    }

    processed.add(tx.id);
  }

  return detected;
}

/**
 * Converte transações detectadas em objetos Installment prontos para salvar.
 * @param detected Lista de parcelados detectados
 * @param categoryId ID da categoria padrão para parcelados
 * @returns Lista de objetos Installment
 */
export function toInstallments(
  detected: DetectedInstallment[],
  categoryId: string
): Omit<Installment, 'id'>[] {
  return detected.map((d) => ({
    description: d.description,
    totalAmount: d.amount * d.totalInstallments,
    installmentAmount: d.amount,
    totalInstallments: d.totalInstallments,
    currentInstallment: d.currentInstallment,
    startDate: d.date,
    categoryId,
    source: 'openfinance' as const,
  }));
}
