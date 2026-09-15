/**
 * @file components/features/BulkTransactionForm/index.tsx
 * @description Formulário de múltiplas transações com shadcn + tailwind + framer-motion + lucide.
 * Inputs shadcn, Select shadcn, badges e animações.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Trash2, CalendarDays, CheckCircle2, Wallet, ArrowUpRight, ArrowDownRight, Hash } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { toInputDate } from '../../../utils/formatters';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

/** Item do formulário em lote */
interface BulkItem {
  id: string;
  description: string;
  amount: string;
  categoryId: string;
}

/** Formulário em lote — shadcn */
const BulkTransactionForm: React.FC = () => {
  const { addTransaction, categories } = useTransactions();
  // Tipo, data e lista de itens
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(toInputDate(new Date()));
  const [items, setItems] = useState<BulkItem[]>([{ id: '1', description: '', amount: '', categoryId: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Categorias filtradas por tipo
  const filteredCategories = categories.filter((cat) => cat.defaultType === type || cat.defaultType === 'both');

  /** Adiciona novo item vazio */
  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now().toString(), description: '', amount: '', categoryId: '' }]);
  };

  /** Remove item (mantém ao menos 1) */
  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /** Atualiza campo do item */
  const updateItem = (id: string, field: keyof BulkItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  /** Valida e salva transações válidas */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((item) => item.description.trim() && item.amount && parseFloat(item.amount) > 0);
    if (validItems.length === 0) return;
    setIsSubmitting(true);
    try {
      validItems.forEach((item) => {
        addTransaction({
          description: item.description.trim(),
          amount: parseFloat(item.amount),
          type,
          date: new Date(date).toISOString(),
          categoryId: item.categoryId || categories[0]?.id || '',
          notes: '',
        });
      });
      setItems([{ id: '1', description: '', amount: '', categoryId: '' }]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Total calculado
  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const isExpense = type === 'expense';

  return (
    <div className="space-y-5">
      {/* Cabeçalho com contagem */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center border border-sky-100 dark:border-transparent">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight leading-none">Adicionar múltiplos itens</h2>
            <p className="text-xs text-muted-foreground mt-1">Lance várias transações com a mesma data</p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs gap-1.5">
          <Hash className="h-3 w-3" />
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seletor de tipo — segmented control shadcn */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl">
          <Button
            type="button"
            variant={!isExpense ? 'default' : 'ghost'}
            onClick={() => setType('income')}
            className={`rounded-xl gap-2 ${isExpense ? 'text-muted-foreground' : 'shadow-sm'}`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Entrada
          </Button>
          <Button
            type="button"
            variant={isExpense ? 'default' : 'ghost'}
            onClick={() => setType('expense')}
            className={`rounded-xl gap-2 ${!isExpense ? 'text-muted-foreground' : 'shadow-sm'}`}
          >
            <ArrowDownRight className="h-4 w-4" />
            Saída
          </Button>
        </div>

        {/* Campo de data */}
        <div className="space-y-1.5 max-w-[200px]">
          <Label className="text-xs flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            Data
          </Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 rounded-xl" />
        </div>

        {/* Lista de itens */}
        <div className="space-y-2.5">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-2xl bg-muted/20">
                <CardContent className="p-3 flex items-center gap-2.5">
                  {/* Índice circular */}
                  <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>

                  {/* Campos do item */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      type="text"
                      placeholder="Descrição"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="h-9 rounded-xl"
                    />
                    <Input
                      type="number"
                      placeholder="Valor"
                      value={item.amount}
                      onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                      min="0"
                      step="0.01"
                      className="h-9 rounded-xl"
                    />
                    <Select value={item.categoryId} onValueChange={(v) => updateItem(item.id, 'categoryId', v)}>
                      <SelectTrigger className="h-9 rounded-xl">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remover */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    aria-label="Remover item"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <Card className="rounded-xl bg-card border-dashed">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Total
            </span>
            <span className={`text-[15px] font-bold tracking-tight ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
              {isExpense ? '-' : '+'}{' '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </span>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={addItem} className="rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" />
            Adicionar item
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="rounded-xl">
            Salvar todos
          </Button>
        </div>

        {/* Mensagem de sucesso */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900">
                <CardContent className="p-3 flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {items.length === 1 ? 'Item adicionado' : 'Itens adicionados'} com sucesso!
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default BulkTransactionForm;
