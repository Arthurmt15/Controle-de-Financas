import styled from 'styled-components';

/** Data do card */
export const CardDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

/** Container da barra de progresso */
export const ProgressContainer = styled.div`
  margin-bottom: 12px;
`;

/** Barra de progresso */
export const ProgressBar = styled.div`
  height: 6px;
  background-color: ${({ theme }) => theme.colors?.border || '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
`;

/** Preenchimento da barra */
export const ProgressFill = styled.div<{ $progress: number; $isCompleted: boolean }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background-color: ${({ $isCompleted, theme }) =>
    $isCompleted
      ? theme.colors?.success || '#10b981'
      : theme.colors?.primary || '#6366f1'};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

/** Texto do progresso */
export const ProgressText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
  text-align: right;
`;

/** Container dos valores */
export const CardAmounts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors?.border || '#e5e7eb'};
`;

/** Linha de valor */
export const AmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};

  strong {
    color: ${({ theme }) => theme.colors?.text || '#1f2937'};
    font-weight: 600;
  }
`;

/** Próximo pagamento - destaque moderno */
export const NextDue = styled.div<{ $days: number }>`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $days }) =>
      $days < 0
        ? '#fecaca'
        : $days === 0
          ? '#fde68a'
          : $days <= 7
            ? '#bfdbfe'
            : '#e5e7eb'};
  background: ${({ $days }) =>
    $days < 0
      ? '#fef2f2'
      : $days === 0
        ? '#fffbeb'
        : $days <= 7
          ? '#eff6ff'
          : '#f9fafb'};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NextDueLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

export const NextDueDate = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text || '#1f2937'};
`;

export const NextDueDays = styled.span<{ $overdue?: boolean }>`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.textSecondary || '#6b7280'};
`;

