/**
 * @file components/features/TransactionList/index.tsx
 * @description Lista de transações redesenhada com shadcn + tailwind + framer-motion.
 * Cards grid com Badge categoria, Dialog para edit/delete, motion stagger e lucide icons.
 * Preserva lógica de filtros, formatters, categorias e exportação.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Search, Inbox, FileSpreadsheet, FileText, SlidersHorizontal } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { exportTransactionsCSV, exportTransactionsPDF } from '../../../utils/exportData';
import TransactionForm from '../TransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { Transaction } from '../../../types';

/**
 * Lista de transações com visual shadcn
 */
const TransactionList: React.FC = () => {
  // Dados e filtros do contexto
  const { filteredTransactions, categories, filters, setFilters, deleteTransaction } = useTransactions();

  // Estado para edição
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  // Estado para confirmação de exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Obtém o nome da categoria pelo ID */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  /** Obtém a cor da categoria pelo ID */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  /** Abre o modal de edição */
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  /** Confirma e executa a exclusão */
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho com título e exportações + filtros em Card */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-[13px] font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Transações • {filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'itens'}
            </CardTitle>
            {/* Botões de exportação */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 h-8 text-xs"
                onClick={() => exportTransactionsCSV({ transactions: filteredTransactions, categories })}
                aria-label="Exportar como CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 h-8 text-xs"
                onClick={() => exportTransactionsPDF({ transactions: filteredTransactions, categories })}
                aria-label="Exportar como PDF"
              >
                <FileText className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filtros: busca + tipo + categoria */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Campo de busca com ícone */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar transações..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                className="pl-9 h-10 rounded-xl"
                aria-label="Buscar transações"
              />
            </div>
            {/* Filtro por tipo - Select shadcn */}
            <Select value={filters.type} onValueChange={(v) => setFilters({ type: v as 'income' | 'expense' | 'both' })}>
              <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Todos</SelectItem>
                <SelectItem value="income">Entradas</SelectItem>
                <SelectItem value="expense">Saídas</SelectItem>
              </SelectContent>
            </Select>
            {/* Filtro por categoria - Select shadcn */}
            <Select value={filters.categoryId || 'all'} onValueChange={(v) => setFilters({ categoryId: v === 'all' ? null : v })}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela desktop - Card com overflow */}
      <Card className="rounded-2xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho da tabela */}
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3">Descrição</th>
                <th className="text-left text-xs font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3">Valor</th>
                <th className="text-left text-xs font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3">Categoria</th>
                <th className="text-left text-xs font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3">Data</th>
                <th className="text-right text-xs font-semibold tracking-widest uppercase text-muted-foreground px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Inbox className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">Nenhuma transação encontrada</p>
                      <p className="text-xs">Ajuste os filtros ou crie uma nova transação</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, idx) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02, duration: 0.25 }}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    {/* Descrição com indicador de tipo */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${transaction.type === 'expense' ? 'bg-red-500' : 'bg-emerald-500'}`} aria-hidden />
                        <span className="text-sm font-medium truncate max-w-[220px]">{transaction.description}</span>
                      </div>
                    </td>
                    {/* Valor com cor por tipo */}
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-semibold ${transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {transaction.type === 'expense' ? '-' : '+'} {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    {/* Badge categoria com cor */}
                    <td className="px-5 py-3.5">
                      <Badge
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white border-0"
                        style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                      >
                        {getCategoryName(transaction.categoryId)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(transaction.date)}</td>
                    {/* Ações editar/excluir */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleEdit(transaction)} aria-label={`Editar ${transaction.description}`} title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => setDeletingId(transaction.id)}
                          aria-label={`Excluir ${transaction.description}`}
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cards mobile + grid desktop alternativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:hidden">
        <AnimatePresence>
          {filteredTransactions.length === 0 ? (
            <Card className="rounded-2xl border-dashed col-span-full">
              <CardContent className="p-10 text-center flex flex-col items-center gap-2 text-muted-foreground">
                <Inbox className="h-8 w-8 opacity-40" />
                <p className="text-sm font-semibold">Nenhuma transação encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction, idx) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
              >
                <Card className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <CardContent className="p-4 space-y-3">
                    {/* Topo: descrição + valor */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${transaction.type === 'expense' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="text-sm font-semibold truncate">{transaction.description}</span>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${transaction.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {transaction.type === 'expense' ? '-' : '+'} {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    {/* Rodapé: categoria + data + ações */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white border-0 shrink-0" style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}>
                          {getCategoryName(transaction.categoryId)}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">{formatDate(transaction.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleEdit(transaction)} aria-label={`Editar ${transaction.description}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setDeletingId(transaction.id)} aria-label={`Excluir ${transaction.description}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Grid alternativo desktop quando quiser visual de cards (mantém tabela acima, grid abaixo é opcional para mobile-first) */}
      {/* Para desktop grid adicional, oculto por padrão - tabela já cobre desktop */}

      {/* Modal de edição - Dialog shadcn */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>Atualize os dados da transação e salve as alterações.</DialogDescription>
          </DialogHeader>
          {editingTransaction && <TransactionForm editingTransaction={editingTransaction} onClose={() => setEditingTransaction(null)} />}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão - Dialog shadcn */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="rounded-xl gap-1.5" onClick={handleConfirmDelete}>
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionList;
