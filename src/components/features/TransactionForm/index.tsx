/**
 * @file components/features/TransactionForm/index.tsx
 * @description Formulário para adicionar e editar transações financeiras.
 * Suporta validação, categorias dinâmicas e modo de edição.
 */

import React, { useState, useEffect } from 'react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Button from '../../common/Button';
import { useTransactions } from '../../../hooks/useTransactions';
import { useInstallments } from '../../../contexts/InstallmentsContext';
import { validateTransactionForm } from '../../../utils/validators';
import { toInputDate } from '../../../utils/formatters';
import * as C from './styles';
import type { Transaction } from '../../../types';

/**
 * Props do componente TransactionForm
 */
interface TransactionFormProps {
  /** Transação sendo editada (null para nova transação) */
  editingTransaction?: Transaction | null;
  /** Função chamada ao fechar o formulário */
  onClose?: () => void;
}

/**
 * Formulário de transações
 * @param {TransactionFormProps} props - Props do componente
 * @returns {JSX.Element} Componente TransactionForm renderizado
 *
 * @example
 * // Formulário para nova transação
 * <TransactionForm />
 *
 * @example
 * // Formulário para edição
 * <TransactionForm editingTransaction={transaction} onClose={() => setEditing(null)} />
 */
const TransactionForm: React.FC<TransactionFormProps> = ({
  editingTransaction = null,
  onClose,
}) => {
  const { addTransaction, updateTransaction, categories } = useTransactions();
  const { addInstallment } = useInstallments();

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
  });

  // Estado de erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado de envio
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Preenche o formulário quando editando uma transação
   */
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
      });
    }
  }, [editingTransaction]);

  /**
   * Atualiza o valor de um campo do formulário
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa erro do campo ao digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Atualiza o tipo da transação
   */
  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData((prev) => ({ ...prev, type, categoryId: '' }));
  };

  // Preview do parcelamento
  const parsedAmount = parseFloat(formData.amount);
  const parsedInstallments = parseInt(formData.totalInstallments, 10);
  const previewInstallmentAmount =
    formData.isInstallment && parsedAmount > 0 && parsedInstallments > 1
      ? parsedAmount / parsedInstallments
      : 0;

  /**
   * Valida e envia o formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valida os dados
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
      if (!editingTransaction && formData.type !== 'expense') {
        // Parcelado normalmente é despesa, mas permite se usuário quiser
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
        // Atualiza transação existente (não cria parcelado ao editar)
        await updateTransaction({
          ...transactionData,
          id: editingTransaction.id,
        });
      } else {
        // Adiciona nova transação
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
      }

      // Reseta o formulário
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        date: toInputDate(new Date()),
        categoryId: '',
        notes: '',
        isInstallment: false,
        totalInstallments: '10',
      });
      setErrors({});

      // Fecha o formulário se estiver em modo de edição
      onClose?.();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtra categorias baseado no tipo selecionado
  const filteredCategories = categories.filter(
    (cat) => cat.defaultType === formData.type || cat.defaultType === 'both'
  );

  return (
    <C.Form onSubmit={handleSubmit}>
      <C.FormTitle>
        {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
      </C.FormTitle>

      {/* Seleção de tipo */}
      <C.TypeSelector>
        <C.TypeButton
          type="button"
          $isActive={formData.type === 'expense'}
          onClick={() => handleTypeChange('expense')}
        >
          Saída
        </C.TypeButton>
        <C.TypeButton
          type="button"
          $isActive={formData.type === 'income'}
          onClick={() => handleTypeChange('income')}
        >
          Entrada
        </C.TypeButton>
      </C.TypeSelector>

      {/* Campos do formulário */}
      <C.FieldsContainer>
        <Input
          name="description"
          label="Descrição"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ex: Almoço no restaurante"
          error={errors.description}
          required
        />

        <Input
          name="amount"
          label="Valor"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0,00"
          error={errors.amount}
          required
        />

        <Select
          name="categoryId"
          label="Categoria"
          value={formData.categoryId}
          onChange={handleChange}
          options={filteredCategories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
          placeholder="Selecione uma categoria"
          error={errors.categoryId}
          required
        />

        <Input
          name="date"
          label="Data"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
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

        {/* Parcelado automático - só para nova transação */}
        {!editingTransaction && (
          <C.InstallmentSection>
            <C.CheckboxRow>
              <input
                type="checkbox"
                name="isInstallment"
                checked={formData.isInstallment}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, isInstallment: e.target.checked }));
                  if (errors.totalInstallments) {
                    setErrors((prev) => ({ ...prev, totalInstallments: '' }));
                  }
                }}
              />
              Compra parcelada? Criar automaticamente em Parcelados
            </C.CheckboxRow>

            {formData.isInstallment && (
              <>
                <Input
                  name="totalInstallments"
                  label="Número de Parcelas"
                  type="number"
                  value={formData.totalInstallments}
                  onChange={handleChange}
                  placeholder="10"
                  error={errors.totalInstallments}
                  required
                />
                {previewInstallmentAmount > 0 && (
                  <C.InstallmentPreview>
                    {`${parsedInstallments}x de R$ ${previewInstallmentAmount.toFixed(2).replace('.', ',')} • Total R$ ${parsedAmount.toFixed(2).replace('.', ',')}`}
                  </C.InstallmentPreview>
                )}
              </>
            )}
          </C.InstallmentSection>
        )}
      </C.FieldsContainer>

      {/* Botões de ação */}
      <C.Actions>
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
        </Button>
      </C.Actions>
    </C.Form>
  );
};

export default TransactionForm;
