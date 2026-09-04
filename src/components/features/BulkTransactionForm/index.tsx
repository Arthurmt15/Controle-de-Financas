/**
 * @file components/features/BulkTransactionForm/index.tsx
 * @description Formulário para adicionar múltiplas transações de uma vez.
 * Permite cadastrar vários itens com descrição, valor e categoria.
 */

import React, { useState } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { toInputDate } from '../../../utils/formatters';
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import * as C from './styles';

/**
 * Interface que representa um item do formulário em lote
 */
interface BulkItem {
  /** Identificador único do item */
  id: string;
  /** Descrição do item */
  description: string;
  /** Valor do item (string para controle de input) */
  amount: string;
  /** ID da categoria */
  categoryId: string;
}

/**
 * Formulário de transações em lote
 * @returns {JSX.Element} Formulário renderizado
 *
 * @example
 * <BulkTransactionForm />
 */
const BulkTransactionForm: React.FC = () => {
  const { addTransaction, categories } = useTransactions();
  /** Tipo das transações (entrada/saída) */
  const [type, setType] = useState<'income' | 'expense'>('expense');
  /** Data comum para todos os itens */
  const [date, setDate] = useState(toInputDate(new Date()));
  /** Lista de itens do formulário */
  const [items, setItems] = useState<BulkItem[]>([
    { id: '1', description: '', amount: '', categoryId: '' },
  ]);
  /** Estado de envio */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Mensagem de sucesso */
  const [success, setSuccess] = useState(false);

  /** Categorias filtradas por tipo */
  const filteredCategories = categories.filter(
    (cat) => cat.defaultType === type || cat.defaultType === 'both'
  );

  /**
   * Adiciona um novo item vazio ao formulário
   */
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: '',
        amount: '',
        categoryId: '',
      },
    ]);
  };

  /**
   * Remove um item pelo ID (mínimo 1 item)
   * @param id - ID do item a ser removido
   */
  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Atualiza um campo de um item específico
   * @param id - ID do item
   * @param field - Campo a ser atualizado
   * @param value - Novo valor
   */
  const updateItem = (id: string, field: keyof BulkItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  /**
   * Valida e envia todas as transações válidas
   * Filtra itens com descrição e valor válidos antes de salvar
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(
      (item) => item.description.trim() && item.amount && parseFloat(item.amount) > 0
    );

    if (validItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // Simula delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      validItems.forEach((item) => {
        addTransaction({
          description: item.description.trim(),
          amount: parseFloat(item.amount),
          type,
          date: new Date(date).toISOString(),
          categoryId: item.categoryId || categories[0]?.id || '',
        });
      });

      // Reseta o formulário
      setItems([{ id: '1', description: '', amount: '', categoryId: '' }]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Calcula o total dos itens */
  const total = items.reduce((sum, item) => {
    const value = parseFloat(item.amount) || 0;
    return sum + value;
  }, 0);

  return (
    <C.Container>
      {/* Cabeçalho com título e contagem */}
      <C.Header>
        <C.Title>Adicionar Múltiplos Itens</C.Title>
        <C.ItemCount>{items.length} {items.length === 1 ? 'item' : 'itens'}</C.ItemCount>
      </C.Header>

      <C.Form onSubmit={handleSubmit}>
        {/* Seletor de tipo */}
        <C.TypeSelector>
          <C.TypeButton
            type="button"
            $isActive={type === 'expense'}
            onClick={() => setType('expense')}
          >
            Saída
          </C.TypeButton>
          <C.TypeButton
            type="button"
            $isActive={type === 'income'}
            onClick={() => setType('income')}
          >
            Entrada
          </C.TypeButton>
        </C.TypeSelector>

        {/* Campo de data */}
        <C.DateField>
          <C.Label>Data</C.Label>
          <C.DateInput
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </C.DateField>

        {/* Lista de itens */}
        <C.ItemsList>
          {items.map((item, index) => (
            <C.ItemRow key={item.id}>
              <C.ItemIndex>{index + 1}</C.ItemIndex>

              <C.ItemFields>
                <C.ItemInput
                  type="text"
                  placeholder="Descrição"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
                <C.ItemInput
                  type="number"
                  placeholder="Valor"
                  value={item.amount}
                  onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                  min="0"
                  step="0.01"
                />
                <C.ItemSelect
                  value={item.categoryId}
                  onChange={(e) => updateItem(item.id, 'categoryId', e.target.value)}
                >
                  <option value="">Categoria</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </C.ItemSelect>
              </C.ItemFields>

              <C.RemoveButton
                type="button"
                onClick={() => removeItem(item.id)}
                disabled={items.length === 1}
                aria-label="Remover item"
              >
                <Icon size={16}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </Icon>
              </C.RemoveButton>
            </C.ItemRow>
          ))}
        </C.ItemsList>

        {/* Total */}
        <C.Total>
          Total: {type === 'expense' ? '-' : '+'}{' '}
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
        </C.Total>

        {/* Botões de ação */}
        <C.Actions>
          <Button type="button" variant="ghost" onClick={addItem}>
            + Adicionar Item
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Salvar Todos
          </Button>
        </C.Actions>

        {/* Mensagem de sucesso */}
        {success && (
          <C.SuccessMessage>
            {items.length === 1 ? 'Item adicionado' : `${items.length} itens adicionados`} com
            sucesso!
          </C.SuccessMessage>
        )}
      </C.Form>
    </C.Container>
  );
};

export default BulkTransactionForm;
