/**
 * @file components/features/TransactionForm/index.tsx
 * @description Formulário de transações redesenhado com shadcn + tailwind + framer-motion.
 * Usa Input, Select, Textarea, Button, Label, Card. Preserva lógica de submit,
 * validação, categorias e criação automática de parcelados.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Calendar, Tag, FileText, Layers, HandCoins } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useInstallments } from '../../../contexts/InstallmentsContext';
import { useDebts } from '../../../contexts/DebtsContext';
import { validateTransactionForm } from '../../../utils/validators';
import { toInputDate } from '../../../utils/formatters';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { Transaction } from '../../../types';

/** Props do formulário */
interface TransactionFormProps {
  /** Transação sendo editada (null para nova) */
  editingTransaction?: Transaction | null;
  /** Função chamada ao fechar */
  onClose?: () => void;
}

/**
 * Formulário de transações - design shadcn
 */
const TransactionForm: React.FC<TransactionFormProps> = ({ editingTransaction = null, onClose }) => {
  // Hooks de dados
  const { addTransaction, updateTransaction, categories } = useTransactions();
  const { addInstallment } = useInstallments();
  const { addDebt } = useDebts();

  // Estado do formulário
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    date: toInputDate(new Date()),
    categoryId: '',
    notes: '',
    isInstallment: false,
    totalInstallments: '10',
    isDividedDebt: false,
    debtInstallments: '10',
  });

  // Estado de erros
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Estado de envio
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Preenche o formulário quando editando */
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        description: editingTransaction.description,
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        date: editingTransaction.date.split('T')[0],
        categoryId: editingTransaction.categoryId,
        notes: editingTransaction.notes || '',
        isInstallment: false,
        totalInstallments: '10',
        isDividedDebt: false,
        debtInstallments: '10',
      });
    }
  }, [editingTransaction]);

  /** Atualiza campo do formulário */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Atualiza o tipo da transação e limpa categoria */
  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData((prev) => ({ ...prev, type, categoryId: '' }));
    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
  };

  // Preview do parcelamento
  const parsedAmount = parseFloat(formData.amount);
  const parsedInstallments = parseInt(formData.totalInstallments, 10);
  const previewInstallmentAmount =
    formData.isInstallment && parsedAmount > 0 && parsedInstallments > 1 ? parsedAmount / parsedInstallments : 0;
  const parsedDebtInstallments = parseInt(formData.debtInstallments, 10);
  const previewDebtAmount = formData.isDividedDebt && parsedAmount > 0 && parsedDebtInstallments > 1 ? parsedAmount / parsedDebtInstallments : 0;

  /** Valida e envia o formulário */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida dados via util central
    const validationErrors = validateTransactionForm({
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      categoryId: formData.categoryId,
    });

    if (formData.isInstallment) {
      const n = parseInt(formData.totalInstallments, 10);
      if (!n || n < 2 || n > 60) {
        validationErrors.totalInstallments = 'Parcelas deve ser entre 2 e 60';
      }
    }
    if (formData.isDividedDebt) {
      const n = parseInt(formData.debtInstallments, 10);
      if (!n || n < 1 || n > 60) {
        validationErrors.debtInstallments = 'Parcelas deve ser entre 1 e 60';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Monta payload da transação
      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        categoryId: formData.categoryId,
        notes: formData.notes.trim() || '',
      };

      if (editingTransaction) {
        // Atualiza transação existente (não cria parcelado ao editar)
        await updateTransaction({ ...transactionData, id: editingTransaction.id });
      } else {
        // Cria nova transação
        await addTransaction(transactionData);

        // Se marcado como parcelado, cria automaticamente o parcelado
        if (formData.isInstallment && parsedInstallments > 1 && parsedAmount > 0) {
          try {
            await addInstallment({
              description: formData.description.trim(),
              totalAmount: parsedAmount,
              installmentAmount: parsedAmount / parsedInstallments,
              totalInstallments: parsedInstallments,
              currentInstallment: 1,
              startDate: formData.date,
              categoryId: formData.categoryId,
              notes: formData.notes.trim() || undefined,
              source: 'manual',
            });
          } catch (installmentError) {
            console.error('Transação criada, mas falhou ao criar parcelado:', installmentError);
          }
        }

        // Se marcado como dívida dividida, cria automaticamente em Dívidas (mesma lógica)
        if (formData.isDividedDebt && parsedAmount > 0) {
          try {
            const parcels = parsedDebtInstallments > 1 ? parsedDebtInstallments : 1;
            await addDebt({
              description: formData.description.trim(),
              totalAmount: parsedAmount,
              installmentAmount: parsedAmount / parcels,
              totalInstallments: parcels,
              currentInstallment: parcels > 1 ? 1 : 0,
              startDate: formData.date,
              categoryId: formData.categoryId,
              notes: formData.notes.trim() || undefined,
              source: 'manual',
            });
          } catch (debtError) {
            console.error('Transação criada, mas falhou ao criar dívida:', debtError);
          }
        }
      }

      // Reseta formulário
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        date: toInputDate(new Date()),
        categoryId: '',
        notes: '',
        isInstallment: false,
        totalInstallments: '10',
        isDividedDebt: false,
        debtInstallments: '10',
      });
      setErrors({});
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtra categorias baseado no tipo selecionado
  const filteredCategories = categories.filter((cat) => cat.defaultType === formData.type || cat.defaultType === 'both');

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Título com ícone */}
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary">
          <Wallet size={16} />
        </span>
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight">{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h3>
          <p className="text-xs text-muted-foreground">Preencha os campos e salve para registrar</p>
        </div>
      </div>

      {/* Seletor de tipo - Button group shadcn */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-2xl border">
        <Button
          type="button"
          variant={formData.type === 'expense' ? 'destructive' : 'ghost'}
          className={`rounded-xl gap-2 h-10 font-semibold ${formData.type === 'expense' ? 'shadow-sm' : 'hover:bg-background'}`}
          onClick={() => handleTypeChange('expense')}
        >
          <TrendingDown className="h-4 w-4" />
          Saída
        </Button>
        <Button
          type="button"
          variant={formData.type === 'income' ? 'default' : 'ghost'}
          className={`rounded-xl gap-2 h-10 font-semibold ${formData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm' : 'hover:bg-background'}`}
          onClick={() => handleTypeChange('income')}
        >
          <TrendingUp className="h-4 w-4" />
          Entrada
        </Button>
      </div>

      {/* Campos do formulário */}
      <div className="space-y-4">
        {/* Descrição */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="flex items-center gap-1.5 text-sm">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Descrição
          </Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ex: Almoço no restaurante"
            error={errors.description}
            required
            className="rounded-xl h-10"
          />
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="flex items-center gap-1.5 text-sm">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            Valor
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0,00"
            error={errors.amount}
            required
            className="rounded-xl h-10"
            step="0.01"
          />
        </div>

        {/* Categoria - Select shadcn */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            Categoria
          </Label>
          <Select value={formData.categoryId} onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: v }))}>
            <SelectTrigger className={`rounded-xl h-10 ${errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}`}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.length === 0 ? (
                <SelectItem value="none" disabled>
                  Nenhuma categoria para este tipo
                </SelectItem>
              ) : (
                filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-xs font-medium text-red-500">{errors.categoryId}</p>}
        </div>

        {/* Data */}
        <div className="space-y-1.5">
          <Label htmlFor="date" className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Data
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            required
            className="rounded-xl h-10"
          />
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm">
            Observações (opcional)
          </Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Adicione detalhes..."
            rows={3}
            className="rounded-xl"
          />
        </div>

        {/* Parcelado / Dívida automática - só para nova transação */}
        {!editingTransaction && (
          <>
            <Card className="rounded-2xl border-dashed bg-muted/20">
              <CardContent className="p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isInstallment}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, isInstallment: e.target.checked }));
                      if (errors.totalInstallments) setErrors((prev) => ({ ...prev, totalInstallments: '' }));
                    }}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    Compra parcelada? Criar automaticamente em Parcelados
                  </span>
                </label>

                {formData.isInstallment && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-1">
                    <Label htmlFor="totalInstallments" className="text-sm">
                      Número de Parcelas
                    </Label>
                    <Input
                      id="totalInstallments"
                      name="totalInstallments"
                      type="number"
                      value={formData.totalInstallments}
                      onChange={handleChange}
                      placeholder="10"
                      error={errors.totalInstallments}
                      required
                      className="rounded-xl h-10"
                      min={2}
                      max={60}
                    />
                    {previewInstallmentAmount > 0 && (
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium gap-1">
                        <Layers className="h-3 w-3" />
                        {`${parsedInstallments}x de R$ ${previewInstallmentAmount.toFixed(2).replace('.', ',')} • Total R$ ${parsedAmount.toFixed(2).replace('.', ',')}`}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-dashed bg-amber-500/10 border-amber-200 dark:border-amber-500/20">
              <CardContent className="p-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDividedDebt}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, isDividedDebt: e.target.checked }));
                      if (errors.debtInstallments) setErrors((prev) => ({ ...prev, debtInstallments: '' }));
                    }}
                    className="h-4 w-4 rounded border-input accent-amber-600"
                  />
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <HandCoins className="h-3.5 w-3.5 text-amber-600" />
                    Dívida dividida? Criar automaticamente em Dívidas
                  </span>
                </label>

                {formData.isDividedDebt && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-1">
                    <Label htmlFor="debtInstallments" className="text-sm">
                      Número de Parcelas (1 = à vista)
                    </Label>
                    <Input
                      id="debtInstallments"
                      name="debtInstallments"
                      type="number"
                      value={formData.debtInstallments}
                      onChange={handleChange}
                      placeholder="10"
                      error={errors.debtInstallments}
                      required
                      className="rounded-xl h-10"
                      min={1}
                      max={60}
                    />
                    {parsedAmount > 0 && (
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium gap-1 border-amber-200 text-amber-700 dark:border-amber-500/20 dark:text-amber-400">
                        <HandCoins className="h-3 w-3" />
                        {parsedDebtInstallments > 1
                          ? `${parsedDebtInstallments}x de R$ ${previewDebtAmount.toFixed(2).replace('.', ',')} • Total R$ ${parsedAmount.toFixed(2).replace('.', ',')}`
                          : `À vista • Total R$ ${parsedAmount.toFixed(2).replace('.', ',')}`}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} className="rounded-xl shadow-sm">
          {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
        </Button>
      </div>
    </motion.form>
  );
};

export default TransactionForm;
