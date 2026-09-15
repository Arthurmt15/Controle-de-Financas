/**
 * @file components/features/CategoryManager/index.tsx
 * @description Gerenciador de categorias redesenhado com shadcn + tailwind + framer-motion + lucide.
 * Card form, Select shadcn, Badge e confirmação com Dialog inline.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Plus, Trash2, AlertCircle, Palette, Tag } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { getRandomColor } from '../../../utils/formatters';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

/** Ícones disponíveis para categorias (label amigável) */
const AVAILABLE_ICONS = [
  { value: 'FaUtensils', label: 'Alimentação' },
  { value: 'FaCar', label: 'Carro' },
  { value: 'FaHome', label: 'Casa' },
  { value: 'FaGamepad', label: 'Lazer' },
  { value: 'FaHeartbeat', label: 'Saúde' },
  { value: 'FaGraduationCap', label: 'Educação' },
  { value: 'FaMoneyBillWave', label: 'Dinheiro' },
  { value: 'FaLaptop', label: 'Trabalho' },
  { value: 'FaChartLine', label: 'Investimentos' },
  { value: 'FaEllipsisH', label: 'Outros' },
  { value: 'FaShoppingCart', label: 'Compras' },
  { value: 'FaPlane', label: 'Viagem' },
  { value: 'FaGift', label: 'Presente' },
  { value: 'FaBriefcase', label: 'Negócios' },
  { value: 'FaDumbbell', label: 'Academia' },
];

/** Gerenciador de categorias — shadcn */
const CategoryManager: React.FC = () => {
  const { categories, addCategory, deleteCategory, transactions } = useTransactions();
  // Estado do formulário e feedback
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: getRandomColor(),
    icon: 'FaEllipsisH',
    defaultType: 'expense' as 'income' | 'expense' | 'both',
  });
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Valida e adiciona categoria */
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }
    if (newCategory.name.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    const exists = categories.some((c) => c.name.toLowerCase() === newCategory.name.trim().toLowerCase());
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
    setNewCategory({ name: '', color: getRandomColor(), icon: 'FaEllipsisH', defaultType: 'expense' });
    setError('');
    setIsAdding(false);
  };

  /** Confirma exclusão — bloqueia se houver transações */
  const handleConfirmDelete = (id: string) => {
    const used = transactions.some((t) => t.categoryId === id);
    if (used) {
      setError('Não é possível excluir uma categoria que possui transações');
      return;
    }
    deleteCategory(id);
    setDeletingId(null);
  };

  /** Conta uso da categoria */
  const getCategoryUsageCount = (categoryId: string): number => transactions.filter((t) => t.categoryId === categoryId).length;

  return (
    <div className="space-y-5">
      {/* Cabeçalho com título e ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-100 dark:border-transparent">
            <Tags className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight leading-none">Gerenciar categorias</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'} cadastradas
            </p>
          </div>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-xl shrink-0">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova categoria
          </Button>
        )}
      </div>

      {/* Formulário de nova categoria — animado */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <Card className="rounded-2xl border-dashed bg-muted/20">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Nova categoria
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nome</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => {
                        setNewCategory((prev) => ({ ...prev, name: e.target.value }));
                        setError('');
                      }}
                      placeholder="Ex: Alimentação"
                      className="h-9 rounded-xl"
                    />
                  </div>

                  {/* Tipo */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={newCategory.defaultType}
                      onValueChange={(v) => setNewCategory((prev) => ({ ...prev, defaultType: v as typeof prev.defaultType }))}
                    >
                      <SelectTrigger className="h-9 rounded-xl">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Saída</SelectItem>
                        <SelectItem value="income">Entrada</SelectItem>
                        <SelectItem value="both">Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cor */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cor</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-12 rounded-xl overflow-hidden border shrink-0">
                        <Input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))}
                          className="absolute inset-0 h-full w-full p-0 border-0 rounded-none cursor-pointer"
                        />
                      </div>
                      <Badge variant="outline" className="rounded-full font-mono text-xs">
                        {newCategory.color}
                      </Badge>
                      <span className="w-3 h-3 rounded-full shrink-0 border" style={{ background: newCategory.color }} />
                    </div>
                  </div>

                  {/* Ícone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ícone</Label>
                    <Select value={newCategory.icon} onValueChange={(v) => setNewCategory((prev) => ({ ...prev, icon: v }))}>
                      <SelectTrigger className="h-9 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ICONS.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Erro validado */}
                {error && (
                  <div className="mt-4 flex gap-2 items-center text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsAdding(false);
                      setError('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCategory} className="rounded-xl">
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Erro global fora do form */}
      {!isAdding && error && (
        <div className="flex gap-2 items-center text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid de categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03, duration: 0.25 }}
          >
            <Card className="rounded-2xl hover:shadow-sm transition-shadow">
              <CardContent className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Bolinha de cor */}
                  <span className="w-3 h-3 rounded-full shrink-0 border border-black/5" style={{ background: category.color }} />
                  <div className="min-w-0">
                    <span className="text-[13.5px] font-semibold truncate flex items-center gap-1.5">
                      <Tag className="h-3 w-3 text-muted-foreground hidden sm:inline" />
                      {category.name}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`rounded-full text-[10px] px-2 py-0 ${
                          category.defaultType === 'income'
                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                            : category.defaultType === 'expense'
                              ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-950/20'
                              : 'bg-muted'
                        }`}
                      >
                        {category.defaultType === 'income' ? 'Entrada' : category.defaultType === 'expense' ? 'Saída' : 'Ambos'}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground text-[11px] font-normal">
                        {getCategoryUsageCount(category.id)} transações
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Ações: excluir com confirmação */}
                <div className="shrink-0">
                  {deletingId === category.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium mr-1">Excluir?</span>
                      <Button size="sm" variant="destructive" onClick={() => handleConfirmDelete(category.id)} className="h-7 px-2.5 rounded-lg text-xs">
                        Sim
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeletingId(null)} className="h-7 px-2.5 rounded-lg text-xs">
                        Não
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => setDeletingId(category.id)}
                      aria-label={`Excluir ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Estado vazio auxiliar se nenhuma categoria */}
      {categories.length === 0 && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="p-8 text-center">
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Tags className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold">Nenhuma categoria ainda</p>
            <p className="mt-1 text-xs text-muted-foreground">Clique em “Nova categoria” para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryManager;
