/**
 * @file components/features/CategoryManager/index.tsx
 * @description Gerenciador de categorias de transações.
 * Permite criar, visualizar e excluir categorias com validação.
 */

import React, { useState } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { getRandomColor } from '../../../utils/formatters';
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import * as C from './styles';

/** Lista de ícones disponíveis para categorias */
const AVAILABLE_ICONS = [
  { value: 'FaUtensils', label: 'Utensílios' },
  { value: 'FaCar', label: 'Carro' },
  { value: 'FaHome', label: 'Casa' },
  { value: 'FaGamepad', label: 'Jogo' },
  { value: 'FaHeartbeat', label: 'Saúde' },
  { value: 'FaGraduationCap', label: 'Educação' },
  { value: 'FaMoneyBillWave', label: 'Dinheiro' },
  { value: 'FaLaptop', label: 'Laptop' },
  { value: 'FaChartLine', label: 'Gráfico' },
  { value: 'FaEllipsisH', label: 'Outros' },
  { value: 'FaShoppingCart', label: 'Compras' },
  { value: 'FaPlane', label: 'Viagem' },
  { value: 'FaGift', label: 'Presente' },
  { value: 'FaBriefcase', label: 'Trabalho' },
  { value: 'FaDumbbell', label: 'Academia' },
];

/**
 * Componente de gerenciamento de categorias
 * @returns {JSX.Element} Gerenciador renderizado
 *
 * @example
 * <CategoryManager />
 */
const CategoryManager: React.FC = () => {
  const { categories, addCategory, deleteCategory, transactions } = useTransactions();
  /** Controle de visibilidade do formulário */
  const [isAdding, setIsAdding] = useState(false);
  /** Estado do formulário de nova categoria */
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: getRandomColor(),
    icon: 'FaEllipsisH',
    defaultType: 'expense' as 'income' | 'expense' | 'both',
  });
  /** Mensagem de erro */
  const [error, setError] = useState('');
  /** ID da categoria sendo excluída */
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Valida e adiciona uma nova categoria
   * Verifica nome obrigatório, mínimo de caracteres e duplicatas
   */
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }

    if (newCategory.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    const exists = categories.some(
      (c) => c.name.toLowerCase() === newCategory.name.trim().toLowerCase()
    );
    if (exists) {
      setError('Já existe uma categoria com este nome');
      return;
    }

    addCategory({
      name: newCategory.name.trim(),
      color: newCategory.color,
      icon: newCategory.icon,
      defaultType: newCategory.defaultType,
    });

    setNewCategory({
      name: '',
      color: getRandomColor(),
      icon: 'FaEllipsisH',
      defaultType: 'expense',
    });
    setError('');
    setIsAdding(false);
  };

  /**
   * Confirma e executa a exclusão de uma categoria
   * Verifica se a categoria possui transações antes de excluir
   * @param id - ID da categoria a ser excluída
   */
  const handleConfirmDelete = (id: string) => {
    const usedInTransaction = transactions.some((t) => t.categoryId === id);
    if (usedInTransaction) {
      setError('Não é possível excluir uma categoria que possui transações');
      return;
    }
    deleteCategory(id);
    setDeletingId(null);
  };

  /**
   * Conta quantas transações usam uma categoria
   * @param categoryId - ID da categoria
   * @returns Número de transações que usam a categoria
   */
  const getCategoryUsageCount = (categoryId: string): number => {
    return transactions.filter((t) => t.categoryId === categoryId).length;
  };

  return (
    <C.Container>
      {/* Cabeçalho com título e botão de adicionar */}
      <C.Header>
        <C.Title>Gerenciar Categorias</C.Title>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            + Nova Categoria
          </Button>
        )}
      </C.Header>

      {/* Formulário de nova categoria */}
      {isAdding && (
        <C.AddForm>
          <C.FormTitle>Nova Categoria</C.FormTitle>
          <C.FieldsGrid>
            <C.FieldGroup>
              <C.Label>Nome</C.Label>
              <C.Input
                type="text"
                value={newCategory.name}
                onChange={(e) => {
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }));
                  setError('');
                }}
                placeholder="Nome da categoria"
              />
            </C.FieldGroup>

            <C.FieldGroup>
              <C.Label>Tipo</C.Label>
              <C.Select
                value={newCategory.defaultType}
                onChange={(e) =>
                  setNewCategory((prev) => ({
                    ...prev,
                    defaultType: e.target.value as 'income' | 'expense' | 'both',
                  }))
                }
              >
                <option value="expense">Saída</option>
                <option value="income">Entrada</option>
                <option value="both">Ambos</option>
              </C.Select>
            </C.FieldGroup>

            <C.FieldGroup>
              <C.Label>Cor</C.Label>
              <C.ColorPicker>
                <C.ColorInput
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory((prev) => ({ ...prev, color: e.target.value }))
                  }
                />
                <C.ColorValue>{newCategory.color}</C.ColorValue>
              </C.ColorPicker>
            </C.FieldGroup>

            <C.FieldGroup>
              <C.Label>Ícone</C.Label>
              <C.Select
                value={newCategory.icon}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, icon: e.target.value }))
                }
              >
                {AVAILABLE_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </C.Select>
            </C.FieldGroup>
          </C.FieldsGrid>

          {error && <C.ErrorMessage>{error}</C.ErrorMessage>}

          <C.FormActions>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setError('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddCategory}>Adicionar</Button>
          </C.FormActions>
        </C.AddForm>
      )}

      {/* Grid de categorias existentes */}
      <C.CategoriesGrid>
        {categories.map((category) => (
          <C.CategoryCard key={category.id}>
            <C.CategoryInfo>
              <C.CategoryColor $color={category.color} />
              <C.CategoryDetails>
                <C.CategoryName>{category.name}</C.CategoryName>
                <C.CategoryMeta>
                  <C.CategoryType>
                    {category.defaultType === 'income'
                      ? 'Entrada'
                      : category.defaultType === 'expense'
                      ? 'Saída'
                      : 'Ambos'}
                  </C.CategoryType>
                  <C.CategoryUsage>
                    {getCategoryUsageCount(category.id)} transações
                  </C.CategoryUsage>
                </C.CategoryMeta>
              </C.CategoryDetails>
            </C.CategoryInfo>

            <C.CategoryActions>
              {deletingId === category.id ? (
                <C.DeleteConfirm>
                  <span>Excluir?</span>
                  <C.ConfirmButton
                    onClick={() => handleConfirmDelete(category.id)}
                    $variant="danger"
                  >
                    Sim
                  </C.ConfirmButton>
                  <C.ConfirmButton onClick={() => setDeletingId(null)} $variant="ghost">
                    Não
                  </C.ConfirmButton>
                </C.DeleteConfirm>
              ) : (
                <C.DeleteButton
                  onClick={() => setDeletingId(category.id)}
                  aria-label={`Excluir ${category.name}`}
                >
                  <Icon size={16}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </Icon>
                </C.DeleteButton>
              )}
            </C.CategoryActions>
          </C.CategoryCard>
        ))}
      </C.CategoriesGrid>
    </C.Container>
  );
};

export default CategoryManager;
