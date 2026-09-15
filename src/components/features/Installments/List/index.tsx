/**
 * @file components/features/Installments/List/index.tsx
 * @description Lista de compras parceladas com progresso e ações.
 * Mostra barras de progresso e permite avançar parcelas.
 */

import React, { useState } from 'react';
import { useInstallments } from '../../../../contexts/InstallmentsContext';
import { useTransactions } from '../../../../hooks/useTransactions';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import Modal from '../../../common/Modal';
import Icon from '../../../common/Icon';
import InstallmentForm from '../Form';
import * as C from './styles';
import type { Installment } from '../../../../types';

interface InstallmentListProps {
  installments?: Installment[];
}

 /** Lista de compras parceladas */
const InstallmentList: React.FC<InstallmentListProps> = ({ installments: propInstallments }) => {
  const { installments: ctxInstallments, isLoading, deleteInstallment, advanceInstallment } = useInstallments();
  const installments = propInstallments ?? ctxInstallments;
  const { categories } = useTransactions();

  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Obtém nome da categoria pelo ID */
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  };

  /** Obtém cor da categoria pelo ID */
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  /** Calcula progresso do parcelado (0-100%) */
  const getProgress = (installment: Installment): number => {
    return (installment.currentInstallment / installment.totalInstallments) * 100;
  };

  /** Calcula剩余valor a pagar */
  const getRemainingAmount = (installment: Installment): number => {
    return (installment.totalInstallments - installment.currentInstallment) * installment.installmentAmount;
  };

  /** Adiciona meses preservando dia */
  const addMonths = (dateStr: string, months: number): Date => {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  };

  /** Próximo vencimento como Date ou null se concluído */
  const getNextDueDate = (installment: Installment): Date | null => {
    if (installment.currentInstallment >= installment.totalInstallments) return null;
    return addMonths(installment.startDate, installment.currentInstallment);
  };

  const getDaysUntil = (date: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  };

  /** Confirma exclusão */
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteInstallment(deletingId);
      setDeletingId(null);
    }
  };

  /** Avança uma parcela */
  const handleAdvance = async (id: string) => {
    try {
      await advanceInstallment(id);
    } catch (error) {
      console.error('Erro ao avançar parcela:', error);
    }
  };

  if (isLoading) {
    return <C.LoadingContainer>Carregando parcelados...</C.LoadingContainer>;
  }

  if (ctxInstallments.length === 0) {
    return (
      <C.EmptyState>
        <p>Nenhuma compra parcelada encontrada</p>
        <p>Crie um parcelado para controlar suas prestações ou lance uma transação parcelada.</p>
      </C.EmptyState>
    );
  }

  if (installments.length === 0) {
    return (
      <C.EmptyState>
        <p>Nenhum parcelado encontrado para o filtro atual.</p>
        <p>Tente ajustar a busca ou o status.</p>
      </C.EmptyState>
    );
  }

  return (
    <C.Container>
      <C.Header>
        <C.Title>Todos os parcelados • {installments.length} {installments.length === 1 ? 'item' : 'itens'}</C.Title>
      </C.Header>

      <C.CardsGrid>
        {installments.map((installment) => {
          const progress = getProgress(installment);
          const remaining = getRemainingAmount(installment);
          const isCompleted = installment.currentInstallment >= installment.totalInstallments;
          const nextDue = getNextDueDate(installment);
          const daysUntil = nextDue ? getDaysUntil(nextDue) : null;

          return (
            <C.Card key={installment.id} $isCompleted={isCompleted}>
              <C.CardHeader>
                <C.CardDescription>
                  <C.TypeIndicator $type="expense" />
                  <span>{installment.description}</span>
                </C.CardDescription>
                <C.CardActions>
                  {!isCompleted && (
                    <C.ActionButton
                      onClick={() => handleAdvance(installment.id)}
                      title="Avançar parcela"
                    >
                      <Icon size={14}>
                        <polyline points="9 18 15 12 9 6" />
                      </Icon>
                    </C.ActionButton>
                  )}
                  <C.ActionButton
                    onClick={() => setEditingInstallment(installment)}
                    title="Editar"
                  >
                    <Icon size={14}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </Icon>
                  </C.ActionButton>
                  <C.ActionButton
                    $variant="danger"
                    onClick={() => setDeletingId(installment.id)}
                    title="Excluir"
                  >
                    <Icon size={14} color="#ef4444">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </Icon>
                  </C.ActionButton>
                </C.CardActions>
              </C.CardHeader>

              <C.CardInfo>
                <C.CategoryBadge $color={getCategoryColor(installment.categoryId)}>
                  {getCategoryName(installment.categoryId)}
                </C.CategoryBadge>
                <C.CardDate>{formatDate(installment.startDate)}</C.CardDate>
              </C.CardInfo>

              <C.ProgressContainer>
                <C.ProgressBar>
                  <C.ProgressFill $progress={progress} $isCompleted={isCompleted} />
                </C.ProgressBar>
                <C.ProgressText>
                  {installment.currentInstallment}/{installment.totalInstallments} parcelas
                </C.ProgressText>
              </C.ProgressContainer>

              <C.CardAmounts>
                <C.AmountRow>
                  <span>Total:</span>
                  <strong>{formatCurrency(installment.totalAmount)}</strong>
                </C.AmountRow>
                <C.AmountRow>
                  <span>Restante:</span>
                  <strong>{formatCurrency(remaining)}</strong>
                </C.AmountRow>
                <C.AmountRow>
                  <span>Parcela:</span>
                  <strong>{formatCurrency(installment.installmentAmount)}</strong>
                </C.AmountRow>
              </C.CardAmounts>

              {nextDue ? (
                <C.NextDue $days={daysUntil ?? 0}>
                  <C.NextDueLabel>Próximo pagamento</C.NextDueLabel>
                  <C.NextDueDate>{formatDate(nextDue.toISOString().split('T')[0])} • {installment.currentInstallment + 1}/{installment.totalInstallments}</C.NextDueDate>
                  <C.NextDueDays>
                    {daysUntil === 0
                      ? 'Vence hoje'
                      : daysUntil! > 0
                        ? `Em ${daysUntil} dia${daysUntil! > 1 ? 's' : ''}`
                        : `Vencido há ${Math.abs(daysUntil!)} dia${Math.abs(daysUntil!) > 1 ? 's' : ''}`}
                  </C.NextDueDays>
                </C.NextDue>
              ) : (
                <C.NextDue $days={999}>
                  <C.NextDueLabel>Concluído</C.NextDueLabel>
                  <C.NextDueDate>Todas as parcelas pagas</C.NextDueDate>
                </C.NextDue>
              )}

              {installment.source === 'openfinance' && (
                <C.OpenFinanceBadge>Importado do Open Finance</C.OpenFinanceBadge>
              )}
            </C.Card>
          );
        })}
      </C.CardsGrid>

      {/* Modal de edição */}
      <Modal
        isOpen={!!editingInstallment}
        onClose={() => setEditingInstallment(null)}
        title="Editar Parcelado"
        size="lg"
      >
        <InstallmentForm
          installment={editingInstallment}
          onClose={() => setEditingInstallment(null)}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirmar Exclusão"
        size="sm"
        closeOnOverlayClick={false}
      >
        <C.DeleteConfirmation>
          <p>Tem certeza que deseja excluir este parcelado?</p>
          <p>Esta ação não pode ser desfeita.</p>
          <C.DeleteActions>
            <C.DeleteButton onClick={() => setDeletingId(null)} $variant="ghost">
              Cancelar
            </C.DeleteButton>
            <C.DeleteButton onClick={handleConfirmDelete} $variant="danger">
              Excluir
            </C.DeleteButton>
          </C.DeleteActions>
        </C.DeleteConfirmation>
      </Modal>
    </C.Container>
  );
};

export default InstallmentList;
