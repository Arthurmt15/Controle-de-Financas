/**
 * @file utils/chatCommands.ts
 * @description Detector de comandos - re-exporta módulos splitados (<300 linhas cada).
 */
import {
  CREATE_CATEGORY_PATTERNS,
  DELETE_CATEGORY_PATTERNS,
  GENERATE_BILLS_PATTERNS,
  CREATE_RECURRING_PATTERNS,
  UPDATE_RECURRING_PATTERNS,
  DELETE_RECURRING_PATTERNS,
  LIST_RECURRING_PATTERNS,
  SUMMARY_PATTERNS,
  ANALYSIS_PATTERNS,
  LIST_CATEGORIES_PATTERNS,
  HELP_PATTERNS,
  UPDATE_TRANSACTION_PATTERNS,
  DELETE_TRANSACTION_PATTERNS,
} from './chatCommandsPatterns';
import {
  parseRecurringBillInput,
  parseRecurringBillUpdate,
  parseTransactionUpdate,
  parseTransactionTarget,
  capitalizeFirst,
} from './chatCommandsParser';
import type { CommandType } from './chatCommandsExecutor';

export * from './chatCommandsPatterns';
export * from './chatCommandsParser';
export * from './chatCommandsExecutor';

export function detectCommand(text: string): CommandType {
  const trimmed = text.trim();
  for (const pattern of CREATE_CATEGORY_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const name = match[1].trim();
      if (name.length >= 2 && name.length <= 50)
        return { type: 'create_category', name: capitalizeFirst(name) };
    }
  }
  for (const pattern of DELETE_CATEGORY_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { type: 'delete_category', name: match[1].trim() };
  }
  for (const pattern of GENERATE_BILLS_PATTERNS)
    if (pattern.test(trimmed)) return { type: 'generate_bills' };
  for (const pattern of CREATE_RECURRING_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const parsed = parseRecurringBillInput(match[1].trim());
      if (parsed) return { type: 'create_recurring', ...parsed };
    }
  }
  for (const pattern of UPDATE_RECURRING_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const parsed = parseRecurringBillUpdate(match[1].trim());
      if (parsed) return { type: 'update_recurring', ...parsed };
    }
  }
  for (const pattern of DELETE_RECURRING_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return { type: 'delete_recurring', name: match[1].trim() };
  }
  for (const pattern of LIST_RECURRING_PATTERNS)
    if (pattern.test(trimmed)) return { type: 'list_recurring' };
  // Edição/exclusão de transação: antes dos genéricos (resumo/análise/categorias),
  // pois "mudar X para categoria Y" contém a palavra "categoria".
  for (const pattern of UPDATE_TRANSACTION_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const patch = parseTransactionUpdate(match[1].trim());
      if (patch) return { type: 'update_transaction', patch };
    }
  }
  for (const pattern of DELETE_TRANSACTION_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const target = parseTransactionTarget(match[1].trim());
      if (target.target.length >= 2 || target.filterAmount !== undefined || target.filterDate) {
        return { type: 'delete_transaction', ...target };
      }
    }
  }
  for (const pattern of SUMMARY_PATTERNS) if (pattern.test(trimmed)) return { type: 'summary' };
  for (const pattern of ANALYSIS_PATTERNS)
    if (pattern.test(trimmed)) return { type: 'analysis', text: trimmed };
  for (const pattern of LIST_CATEGORIES_PATTERNS)
    if (pattern.test(trimmed)) return { type: 'list_categories' };
  for (const pattern of HELP_PATTERNS) if (pattern.test(trimmed)) return { type: 'help' };
  return { type: null };
}
