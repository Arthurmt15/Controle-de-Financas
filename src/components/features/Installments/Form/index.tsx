/**
 * @file components/features/Installments/Form/index.tsx
 * @description Formulário para criar e editar compras parceladas.
 * Calcula automaticamente o valor de cada prestação.
 */

import React, { useState, useEffect } from 'react';
import Input from '../../../common/Input';
import Select from '../../../common/Select';
import Button from '../../../common/Button';
import { useInstallments } from '../../../../contexts/InstallmentsContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import * as C from './styles';
import type { Installment } from '../../../../types';

/** Props do componente */
interface InstallmentFormProps {
  installment?: Installment | null;
  onClose?: () => void;
}

/** Formulário de compras parceladas */
const InstallmentForm: React.FC<InstallmentFormProps> = ({
  installment = null,
  onClose,
}) => {
  const { addInstallment, updateInstallment } = useInstallments();
  const { categories } = useTransactions();

  /** Estado do formulário */
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: '',
    totalInstallments: '12',
    startDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Preenche o formulário ao editar */
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

  /** Calcula valor de cada prestação */
  const installmentAmount = formData.totalAmount && formData.totalInstallments
    ? parseFloat(formData.totalAmount) / parseInt(formData.totalInstallments, 10)
    : 0;

  /** Atualiza campo do formulário */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /** Valida e envia o formulário */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        await updateInstallment({ ...installmentData, id: installment.id });
      } else {
        await addInstallment(installmentData);
      }

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

  /** Filtra categorias de despesa */
  const expenseCategories = categories.filter(
    (cat) => cat.defaultType === 'expense' || cat.defaultType === 'both'
  );

  return (
    <C.Form onSubmit={handleSubmit}>
      <C.FormTitle>
        {installment ? 'Editar Parcelado' : 'Nova Compra Parcelada'}
      </C.FormTitle>

      <C.FieldsContainer>
        <Input
          name="description"
          label="Descrição"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: Notebook Dell"
          error={errors.description}
          required
        />

        <Input
          name="totalAmount"
          label="Valor Total"
          type="number"
          value={formData.totalAmount}
          onChange={handleChange}
          placeholder="0,00"
          error={errors.totalAmount}
          required
        />

        <Input
          name="totalInstallments"
          label="Número de Parcelas"
          type="number"
          value={formData.totalInstallments}
          onChange={handleChange}
          placeholder="12"
          error={errors.totalInstallments}
          required
        />

        {installmentAmount > 0 && (
          <C.InstallmentPreview>
            {`Cada parcela: R$ ${installmentAmount.toFixed(2)}`}
          </C.InstallmentPreview>
        )}

        <Select
          name="categoryId"
          label="Categoria"
          value={formData.categoryId}
          onChange={handleChange}
          options={expenseCategories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
          placeholder="Selecione uma categoria"
          error={errors.categoryId}
          required
        />

        <Input
          name="startDate"
          label="Data da Primeira Parcela"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
          required
        />

        <C.TextareaContainer>
          <C.TextareaLabel>Observações (opcional)</C.TextareaLabel>
          <C.Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Adicione detalhes..."
            rows={3}
          />
        </C.TextareaContainer>
      </C.FieldsContainer>

      <C.Actions>
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {installment ? 'Salvar Alterações' : 'Criar Parcelado'}
        </Button>
      </C.Actions>
    </C.Form>
  );
};

export default InstallmentForm;
