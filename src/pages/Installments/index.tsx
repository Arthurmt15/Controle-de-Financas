/**
 * @file pages/Installments/index.tsx
 * @description Página de parcelados redesenhada.
 * Foco em visualizar e acompanhar todos os parcelados em um só lugar.
 */

import React, { useState, useMemo } from 'react';
import { FaLayerGroup, FaCreditCard, FaHourglassHalf, FaCalendarCheck } from 'react-icons/fa';
import InstallmentForm from '../../components/features/Installments/Form';
import InstallmentList from '../../components/features/Installments/List';
import { useInstallments } from '../../contexts/InstallmentsContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
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

  /** Calcula próximo vencimento: startDate + currentInstallment meses */
  function addMonths(dateStr: string, months: number): Date {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  }

  function getDaysUntil(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  /** Próximo vencimento aproximado (baseado em startDate + currentInstallment) */
  const nextDueInfo = useMemo(() => {
    const active = installments.filter((i) => i.currentInstallment < i.totalInstallments);
    if (active.length === 0) return null;
    const withDue = active.map((inst) => ({
      inst,
      dueDate: addMonths(inst.startDate, inst.currentInstallment),
    }));
    withDue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const nearest = withDue[0];
    const days = getDaysUntil(nearest.dueDate);
    return {
      installment: nearest.inst,
      dueDate: nearest.dueDate,
      dueDateStr: formatDate(nearest.dueDate.toISOString().split('T')[0]),
      daysUntil: days,
    };
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

      {/* Cards de resumo - estilo moderno sem emoji */}
      <C.SummaryGrid>
        <C.SummaryCard $variant="neutral">
          <C.SummaryIcon $variant="neutral"><FaLayerGroup /></C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Total de parcelados</C.SummaryLabel>
            <C.SummaryValue>{metrics.total}</C.SummaryValue>
            <C.SummarySub>{metrics.activeCount} ativos • {metrics.completedCount} concluídos</C.SummarySub>
          </C.SummaryContent>
        </C.SummaryCard>

        <C.SummaryCard $variant="primary">
          <C.SummaryIcon $variant="primary"><FaCreditCard /></C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Valor total parcelado</C.SummaryLabel>
            <C.SummaryValue>{formatCurrency(metrics.totalAmount)}</C.SummaryValue>
            <C.SummarySub>{formatCurrency(metrics.totalPaid)} já pagos</C.SummarySub>
          </C.SummaryContent>
        </C.SummaryCard>

        <C.SummaryCard $variant="warning">
          <C.SummaryIcon $variant="warning"><FaHourglassHalf /></C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Valor restante</C.SummaryLabel>
            <C.SummaryValue>{formatCurrency(metrics.totalRemaining)}</C.SummaryValue>
            <C.SummarySub>{metrics.remainingInstallments} parcelas restantes</C.SummarySub>
          </C.SummaryContent>
        </C.SummaryCard>

        <C.SummaryCard $variant="success">
          <C.SummaryIcon $variant="success"><FaCalendarCheck /></C.SummaryIcon>
          <C.SummaryContent>
            <C.SummaryLabel>Próximo pagamento</C.SummaryLabel>
            <C.SummaryValue style={{ fontSize: nextDueInfo ? 13 : 16 }}>
              {nextDueInfo ? `${nextDueInfo.dueDateStr} • ${nextDueInfo.installment.description.slice(0, 18)}${nextDueInfo.installment.description.length > 18 ? '…' : ''}` : 'Nenhum pendente'}
            </C.SummaryValue>
            <C.SummarySub>
              {nextDueInfo
                ? `${nextDueInfo.installment.currentInstallment + 1}/${nextDueInfo.installment.totalInstallments} • ${formatCurrency(Number(nextDueInfo.installment.installmentAmount))} • ${nextDueInfo.daysUntil === 0 ? 'vence hoje' : nextDueInfo.daysUntil > 0 ? `em ${nextDueInfo.daysUntil}d` : `vencido há ${Math.abs(nextDueInfo.daysUntil)}d`}`
                : 'Tudo em dia'}
            </C.SummarySub>
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
