/**
 * @file components/features/TransactionForm/index.tsx
 * @description Formulário unificado: transação + criação opcional de parcelado OU dívida (mesma lógica).
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

interface TransactionFormProps {
  editingTransaction?: Transaction | null;
  onClose?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ editingTransaction = null, onClose }) => {
  const { addTransaction, updateTransaction, categories } = useTransactions();
  const { addInstallment } = useInstallments();
  const { addDebt } = useDebts();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    date: toInputDate(new Date()),
    categoryId: '',
    notes: '',
    creationType: 'none' as 'none' | 'parcelado' | 'dividida',
    totalInstallments: '10',
    debtInstallments: '10',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        description: editingTransaction.description,
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        date: editingTransaction.date.split('T')[0],
        categoryId: editingTransaction.categoryId,
        notes: editingTransaction.notes || '',
        creationType: 'none',
        totalInstallments: '10',
        debtInstallments: '10',
      });
    }
  }, [editingTransaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData((prev) => ({ ...prev, type, categoryId: '' }));
    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
  };

  const parsedAmount = parseFloat(formData.amount);
  const parsedInstallments = parseInt(formData.totalInstallments, 10);
  const previewInstallmentAmount = formData.creationType === 'parcelado' && parsedAmount > 0 && parsedInstallments > 1 ? parsedAmount / parsedInstallments : 0;
  const parsedDebtInstallments = parseInt(formData.debtInstallments, 10);
  const previewDebtAmount = formData.creationType === 'dividida' && parsedAmount > 0 && parsedDebtInstallments > 1 ? parsedAmount / parsedDebtInstallments : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateTransactionForm({
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      categoryId: formData.categoryId,
    });
    if (formData.creationType === 'parcelado') {
      const n = parseInt(formData.totalInstallments, 10);
      if (!n || n < 2 || n > 60) validationErrors.totalInstallments = 'Parcelas deve ser entre 2 e 60';
    }
    if (formData.creationType === 'dividida') {
      const n = parseInt(formData.debtInstallments, 10);
      if (!n || n < 1 || n > 60) validationErrors.debtInstallments = 'Parcelas deve ser entre 1 e 60';
    }
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsSubmitting(true);
    try {
      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        categoryId: formData.categoryId,
        notes: formData.notes.trim() || '',
      };
      if (editingTransaction) {
        await updateTransaction({ ...transactionData, id: editingTransaction.id });
      } else {
        await addTransaction(transactionData);
        if (formData.creationType === 'parcelado' && parsedInstallments > 1 && parsedAmount > 0) {
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
          } catch (err) { console.error('Falhou ao criar parcelado:', err); }
        }
        if (formData.creationType === 'dividida' && parsedAmount > 0) {
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
          } catch (err) { console.error('Falhou ao criar dívida:', err); }
        }
      }
      setFormData({
        description: '', amount: '', type: 'expense', date: toInputDate(new Date()), categoryId: '', notes: '',
        creationType: 'none', totalInstallments: '10', debtInstallments: '10',
      });
      setErrors({});
      onClose?.();
    } catch (error) { console.error('Erro ao salvar transação:', error); }
    finally { setIsSubmitting(false); }
  };

  const filteredCategories = categories.filter((cat) => cat.defaultType === formData.type || cat.defaultType === 'both');

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary"><Wallet size={16} /></span>
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight">{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h3>
          <p className="text-xs text-muted-foreground">{formData.creationType === 'parcelado' ? 'Será criada em Transações + Parcelados' : formData.creationType === 'dividida' ? 'Será criada em Transações + Dívidas' : 'Preencha e salve para registrar'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-2xl border">
        <Button type="button" variant={formData.type === 'expense' ? 'destructive' : 'ghost'} className={`rounded-xl gap-2 h-10 font-semibold ${formData.type === 'expense' ? 'shadow-sm' : 'hover:bg-background'}`} onClick={() => handleTypeChange('expense')}><TrendingDown className="h-4 w-4" />Saída</Button>
        <Button type="button" variant={formData.type === 'income' ? 'default' : 'ghost'} className={`rounded-xl gap-2 h-10 font-semibold ${formData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm' : 'hover:bg-background'}`} onClick={() => handleTypeChange('income')}><TrendingUp className="h-4 w-4" />Entrada</Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="description" className="flex items-center gap-1.5 text-sm"><FileText className="h-3.5 w-3.5 text-muted-foreground" />Descrição</Label>
          <Input id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Ex: Almoço no restaurante" error={errors.description} required className="rounded-xl h-10" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount" className="flex items-center gap-1.5 text-sm"><Wallet className="h-3.5 w-3.5 text-muted-foreground" />Valor</Label>
          <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="0,00" error={errors.amount} required className="rounded-xl h-10" step="0.01" />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm"><Tag className="h-3.5 w-3.5 text-muted-foreground" />Categoria</Label>
          <Select value={formData.categoryId} onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: v }))}>
            <SelectTrigger className={`rounded-xl h-10 ${errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}`}><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
            <SelectContent>
              {filteredCategories.length === 0 ? <SelectItem value="none" disabled>Nenhuma categoria para este tipo</SelectItem> : filteredCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-xs font-medium text-red-500">{errors.categoryId}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date" className="flex items-center gap-1.5 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />Data</Label>
          <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} error={errors.date} required className="rounded-xl h-10" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-sm">Observações (opcional)</Label>
          <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Adicione detalhes..." rows={3} className="rounded-xl" />
        </div>

        {!editingTransaction && (
          <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Criar também em</p>
                <p className="text-[11px] text-muted-foreground">Escolha onde este lançamento deve aparecer. Mesma lógica de parcelas.</p>
              </div>
              <div className="px-2 pb-2">
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/50 rounded-xl">
                  <Button type="button" variant={formData.creationType === 'none' ? 'default' : 'ghost'} className={`rounded-lg h-9 text-xs font-semibold ${formData.creationType === 'none' ? 'shadow-sm bg-card border text-foreground' : ''}`} onClick={() => setFormData((p) => ({ ...p, creationType: 'none' }))}>Só transação</Button>
                  <Button type="button" variant={formData.creationType === 'parcelado' ? 'default' : 'ghost'} className={`rounded-lg h-9 text-xs font-semibold gap-1 ${formData.creationType === 'parcelado' ? 'shadow-sm' : ''}`} onClick={() => setFormData((p) => ({ ...p, creationType: 'parcelado' }))}><Layers className="h-3 w-3" />Parcelado</Button>
                  <Button type="button" variant={formData.creationType === 'dividida' ? 'default' : 'ghost'} className={`rounded-lg h-9 text-xs font-semibold gap-1 ${formData.creationType === 'dividida' ? 'shadow-sm bg-amber-500 hover:bg-amber-600 text-white' : ''}`} onClick={() => setFormData((p) => ({ ...p, creationType: 'dividida' }))}><HandCoins className="h-3 w-3" />Dívida</Button>
                </div>
              </div>

              {formData.creationType === 'parcelado' && (
                <div className="px-4 pb-4 pt-2 space-y-2 border-t bg-violet-50/40 dark:bg-violet-500/5">
                  <Label htmlFor="totalInstallments" className="text-sm flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-violet-600" />Parcelas</Label>
                  <Input id="totalInstallments" name="totalInstallments" type="number" value={formData.totalInstallments} onChange={handleChange} placeholder="10" error={errors.totalInstallments} required className="rounded-xl h-10" min={2} max={60} />
                  {previewInstallmentAmount > 0 && <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium gap-1 border-violet-200 text-violet-700 dark:border-violet-500/20 dark:text-violet-300"><Layers className="h-3 w-3" />{`${parsedInstallments}x de R$ ${previewInstallmentAmount.toFixed(2).replace('.', ',')} • Total R$ ${parsedAmount.toFixed(2).replace('.', ',')}`}</Badge>}
                  <p className="text-[11px] text-muted-foreground">Aparecerá em <strong>Parcelados & Dívidas</strong> como Parcelado.</p>
                </div>
              )}
              {formData.creationType === 'dividida' && (
                <div className="px-4 pb-4 pt-2 space-y-2 border-t bg-amber-50 dark:bg-amber-500/5">
                  <Label htmlFor="debtInstallments" className="text-sm flex items-center gap-1.5"><HandCoins className="h-3.5 w-3.5 text-amber-600" />Parcelas (1 = à vista)</Label>
                  <Input id="debtInstallments" name="debtInstallments" type="number" value={formData.debtInstallments} onChange={handleChange} placeholder="10" error={errors.debtInstallments} required className="rounded-xl h-10" min={1} max={60} />
                  {parsedAmount > 0 && <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium gap-1 border-amber-200 text-amber-700 dark:border-amber-500/20 dark:text-amber-400"><HandCoins className="h-3 w-3" />{parsedDebtInstallments > 1 ? `${parsedDebtInstallments}x de R$ ${previewDebtAmount.toFixed(2).replace('.', ',')} • Total R$ ${parsedAmount.toFixed(2).replace('.', ',')}` : `À vista • Total R$ ${parsedAmount.toFixed(2).replace('.', ',')}`}</Badge>}
                  <p className="text-[11px] text-muted-foreground">Aparecerá em <strong>Parcelados & Dívidas</strong> como Dívida dividida.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        {onClose && <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancelar</Button>}
        <Button type="submit" isLoading={isSubmitting} className="rounded-xl shadow-sm">{editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}</Button>
      </div>
    </motion.form>
  );
};

export default TransactionForm;
