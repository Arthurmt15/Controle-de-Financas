/**
 * @file components/features/Installments/Form/index.tsx
 * @description Formulário de parcelados com shadcn + tailwind.
 * Usa Input, Select (Radix), Textarea e Button do design system.
 * Calcula preview da parcela e valida campos antes de enviar.
 */

import React, { useState, useEffect } from 'react';
import { Calculator, Save, X } from 'lucide-react';
import { useInstallments } from '../../../../contexts/InstallmentsContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Button } from '../../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { Installment } from '../../../../types';

/** Props do formulário */
interface InstallmentFormProps {
  /** Parcelado existente para edição; null para criação */
  installment?: Installment | null;
  /** Callback ao fechar/cancelar */
  onClose?: () => void;
}

/** Formulário de criação/edição de parcelados */
const InstallmentForm: React.FC<InstallmentFormProps> = ({ installment = null, onClose }) => {
  // Hooks de dados
  const { addInstallment, updateInstallment } = useInstallments();
  const { categories, addTransaction } = useTransactions();

  // Estado controlado dos campos
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    totalInstallments: '12',
    startDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    notes: '',
  });

  // Erros de validação por campo
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Flag de envio para bloquear botão
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Preenche formulário quando em modo edição */
  useEffect(() => {
    if (installment) {
      setFormData({
        description: installment.description,
        totalAmount: String(installment.totalAmount),
        totalInstallments: String(installment.totalInstallments),
        startDate: installment.startDate,
        categoryId: installment.categoryId,
        notes: installment.notes || '',
      });
    }
  }, [installment]);

  /** Valor calculado de cada parcela */
  const installmentAmount =
    formData.totalAmount && formData.totalInstallments
      ? parseFloat(formData.totalAmount) / parseInt(formData.totalInstallments, 10)
      : 0;

  /** Atualiza campo texto/textarea e limpa erro correspondente */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Atualiza categoria via Select Radix */
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: '' }));
  };

  /** Valida e envia dados para criação/atualização */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação simples
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Valor deve ser maior que 0';
    }
    if (parseInt(formData.totalInstallments, 10) <= 0) {
      newErrors.totalInstallments = 'Deve ter pelo menos 1 parcela';
    }
    if (!formData.categoryId) newErrors.categoryId = 'Categoria é obrigatória';
    if (!formData.startDate) newErrors.startDate = 'Data é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const total = parseFloat(formData.totalAmount);
      const parcels = parseInt(formData.totalInstallments, 10);
      const installmentData = {
        description: formData.description.trim(),
        totalAmount: total,
        installmentAmount: total / parcels,
        totalInstallments: parcels,
        currentInstallment: installment ? installment.currentInstallment : 0,
        startDate: formData.startDate,
        categoryId: formData.categoryId,
        notes: formData.notes.trim() || undefined,
        source: 'manual' as const,
      };

      if (installment) {
        // Atualiza parcelado existente
        await updateInstallment({ ...installmentData, id: installment.id });
      } else {
        // Cria novo parcelado
        await addInstallment(installmentData);
        // Cria transação da 1ª parcela para aparecer em Transações
        try {
          await addTransaction({
            description: `${formData.description.trim()} (1/${parcels})`,
            amount: total / parcels,
            type: 'expense',
            date: new Date(formData.startDate).toISOString(),
            categoryId: formData.categoryId,
            notes: formData.notes.trim()
              ? `Parcelado ${parcels}x - ${formData.notes.trim()}`
              : `Parcelado ${parcels}x - ${formData.description.trim()}`,
          });
        } catch (txError) {
          console.error('Parcelado criado, mas falhou ao criar transação da 1ª parcela:', txError);
        }
      }

      // Limpa formulário e fecha
      setFormData({
        description: '',
        totalAmount: '',
        totalInstallments: '12',
        startDate: new Date().toISOString().split('T')[0],
        categoryId: '',
        notes: '',
      });
      setErrors({});
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar parcelado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtra apenas categorias de despesa
  const expenseCategories = categories.filter((cat) => cat.defaultType === 'expense' || cat.defaultType === 'both');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Título interno do formulário */}
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-primary/10 text-primary">
          <Calculator className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold tracking-tight">
          {installment ? 'Editar Parcelado' : 'Nova Compra Parcelada'}
        </h3>
      </div>

      {/* Grid de campos */}
      <div className="grid gap-4">
        {/* Descrição */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            Descrição <span className="text-red-500">*</span>
          </Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ex: Notebook Dell"
            error={errors.description}
          />
        </div>

        {/* Linha: valor total + parcelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="totalAmount">
              Valor Total <span className="text-red-500">*</span>
            </Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={handleChange}
              placeholder="0,00"
              error={errors.totalAmount}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="totalInstallments">
              Nº de Parcelas <span className="text-red-500">*</span>
            </Label>
            <Input
              id="totalInstallments"
              name="totalInstallments"
              type="number"
              min={1}
              value={formData.totalInstallments}
              onChange={handleChange}
              placeholder="12"
              error={errors.totalInstallments}
            />
          </div>
        </div>

        {/* Preview do valor da parcela - destaque com fundo tonalizado */}
        {installmentAmount > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            <Calculator className="h-4 w-4" />
            Cada parcela: R$ {installmentAmount.toFixed(2)}
          </div>
        )}

        {/* Categoria via Select shadcn */}
        <div className="space-y-1.5">
          <Label>
            Categoria <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className={errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-xs font-medium text-red-500">{errors.categoryId}</p>}
        </div>

        {/* Data da primeira parcela */}
        <div className="space-y-1.5">
          <Label htmlFor="startDate">
            Data da Primeira Parcela <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={errors.startDate}
          />
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Adicione detalhes..."
            rows={3}
          />
        </div>
      </div>

      {/* Ações do formulário */}
      <div className="flex justify-end gap-2 pt-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting} className="rounded-xl">
          <Save className="mr-2 h-4 w-4" />
          {installment ? 'Salvar Alterações' : 'Criar Parcelado'}
        </Button>
      </div>
    </form>
  );
};

export default InstallmentForm;
