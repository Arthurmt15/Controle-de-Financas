/**
 * @file pages/Installments/index.tsx
 * @description Página de parcelados redesenhada.
 * Foco em visualizar e acompanhar todos os parcelados em um só lugar.
 */

import React, { useState, useMemo } from 'react';
import InstallmentForm from '../../components/features/Installments/Form';
import InstallmentList from '../../components/features/Installments/List';
import { useInstallments } from '../../contexts/InstallmentsContext';
import { formatCurrency } from '../../utils/formatters';
import * as C from './styles';

/** Página de Parcelados */
const InstallmentsPage: React.FC = () => {
  const { installments } = useInstallments();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  /** Métricas resumidas */
  const metrics = useMemo(() => {
    const active = installments.filter((i) => i.currentInstallment < i.totalInstallments);
    const completed = installments.filter((i) => i.currentInstallment >= i.totalInstallments);
    const totalAmount = installments.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalRemaining = installments.reduce(
      (sum, i) => sum + (i.totalInstallments - i.currentInstallment) * Number(i.installmentAmount),
      0
    );
    const totalPaid = totalAmount - totalRemaining;
    const remainingInstallments = installments.reduce(
      (sum, i) => sum + (i.totalInstallments - i.currentInstallment),
      0
    );

    return {
      total: installments.length,
      activeCount: active.length,
      completedCount: completed.length,
      totalAmount,
      totalRemaining,
      totalPaid,
      remainingInstallments,
    };
  }, [installments]);

  /** Filtra parcelados por busca e status */
  const filteredInstallments = useMemo(() => {
    return installments.filter((inst) => {
      const matchesSearch =
        !searchTerm ||
        inst.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inst.notes && inst.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const isCompleted = inst.currentInstallment >= inst.totalInstallments;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !isCompleted) ||
        (statusFilter === 'completed' && isCompleted);

      return matchesSearch && matchesStatus;
    });
  }, [installments, searchTerm, statusFilter]);

  /** Próximo vencimento aproximado (baseado em startDate + currentInstallment) */
  const nextDueInfo = useMemo(() => {
    const active = installments.filter((i) => i.currentInstallment < i.totalInstallments);
    if (active.length === 0) return null;
    // Ordena pelo startDate mais recente
    const sorted = [...active].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    return sorted[0];
  }, [installments]);

  return (
    <C.Container>
      <C.Header>
        <C.HeaderTop>
          <C.TitleGroup>
            <C.Title>Parcelados</C.Title>
            <C.Subtitle>Visualize e acompanhe todos os seus parcelados em um só lugar</C.Subtitle>
          </C.TitleGroup>
          <C.AddButton onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Fechar' : '+ Nova compra parcelada'}
          </C.AddButton>
        </C.HeaderTop>
        <C.HeaderHint>
          Seus parcelados são criados automaticamente ao lançar uma transação parcelada ou manualmente aqui. Acompanhe progresso, valor restante e próximas parcelas.
        </C.HeaderHint>
      </C.Header>

      {/* Cards de resumo */}
      <C.SummaryGrid>
        <C.SummaryCard $variant="neutral">
          <C.SummaryIcon>🛒</C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Total de parcelados</C.SummaryLabel>
            <C.SummaryValue>{metrics.total}</C.SummaryValue>
            <C.SummarySub>{metrics.activeCount} ativos • {metrics.completedCount} concluídos</C.SummarySub>
          </C.SummaryContent>
        </C.SummaryCard>

        <C.SummaryCard $variant="primary">
          <C.SummaryIcon>💳</C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Valor total parcelado</C.SummaryLabel>
            <C.SummaryValue>{formatCurrency(metrics.totalAmount)}</C.SummaryValue>
            <C.SummarySub>{formatCurrency(metrics.totalPaid)} já pagos</C.SummarySub>
          </C.SummaryContent>
        </C.SummaryCard>

        <C.SummaryCard $variant="warning">
          <C.SummaryIcon>⏳</C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Valor restante</C.SummaryLabel>
            <C.SummaryValue>{formatCurrency(metrics.totalRemaining)}</C.SummaryValue>
            <C.SummarySub>{metrics.remainingInstallments} parcelas restantes</C.SummarySub>
          </C.SummaryContent>
        </C.SummaryCard>

        <C.SummaryCard $variant="success">
          <C.SummaryIcon>📅</C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Próximo acompanhamento</C.SummaryLabel>
            <C.SummaryValue style={{ fontSize: 14 }}>
              {nextDueInfo ? `${nextDueInfo.description} • ${nextDueInfo.currentInstallment + 1}/${nextDueInfo.totalInstallments}` : 'Nenhum pendente'}
            </C.SummaryValue>
            <C.SummarySub>{nextDueInfo ? `Parcela ${formatCurrency(Number(nextDueInfo.installmentAmount))}` : 'Tudo em dia'}</C.SummarySub>
          </C.SummaryContent>
        </C.SummaryCard>
      </C.SummaryGrid>

      {/* Filtros e busca */}
      <C.FiltersBar>
        <C.SearchInput
          type="text"
          placeholder="Buscar por descrição ou observação..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <C.FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">Todos</option>
          <option value="active">Em andamento</option>
          <option value="completed">Concluídos</option>
        </C.FilterSelect>
        <C.ResultsCount>
          {filteredInstallments.length} de {installments.length}
        </C.ResultsCount>
      </C.FiltersBar>

      {showForm && (
        <C.FormSection>
          <InstallmentForm onClose={() => setShowForm(false)} />
        </C.FormSection>
      )}

      <C.ListSection>
        <InstallmentList installments={filteredInstallments} />
      </C.ListSection>
    </C.Container>
  );
};

export default InstallmentsPage;
