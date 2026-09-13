/**
 * @file src/components/features/OpenFinance/ConnectBank/index.tsx
 * @description Componente que renderiza o widget Pluggy Connect.
 * Permite ao usuário conectar uma instituição financeira.
 */

import React, { useEffect, useState } from 'react';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import { getConnectToken } from '../../../../services/openFinanceService';
import { Container, WidgetWrapper, CloseButton, LoadingMessage, ErrorMessage } from './styles';

/** Props do componente ConnectBank */
interface ConnectBankProps {
  /** Callback chamado após sucesso na conexão */
  onSuccess: () => void;
  /** Callback chamado em caso de erro */
  onError: (message: string) => void;
  /** Callback para fechar o widget */
  onClose: () => void;
}

/**
 * Componente que exibe o widget Pluggy Connect.
 * Gerencia autenticação e eventos de conexão.
 */
const ConnectBank: React.FC<ConnectBankProps> = ({ onSuccess, onError, onClose }) => {
  const { addItem } = useOpenFinance();
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Carrega o connect token ao montar o componente */
  useEffect(() => {
    async function loadToken() {
      try {
        const token = await getConnectToken();
        setConnectToken(token.accessToken);
      } catch (err) {
        setError('Erro ao gerar token de conexão');
        onError('Erro ao gerar token de conexão');
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, [onError]);

  /** Carrega o script do Pluggy Connect Widget */
  useEffect(() => {
    if (!connectToken) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.pluggy.ai/plugin/v2/pluggy-connect.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [connectToken]);

  /**
   * Manipula o sucesso da conexão.
   * Salva o item no banco local e chama callback de sucesso.
   */
  const handleSuccess = async (data: { item: { id: string; connectorId: number; name: string } }) => {
    try {
      await addItem(data.item.id, data.item.connectorId, data.item.name);
      onSuccess();
    } catch (err) {
      onError('Erro ao salvar conexão');
    }
  };

  /**
   * Manipula erros do widget.
   */
  const handleError = (err: { message: string }) => {
    setError(err.message);
    onError(err.message);
  };

  if (loading) {
    return (
      <Container>
        <WidgetWrapper>
          <LoadingMessage>Carregando widget de conexão...</LoadingMessage>
        </WidgetWrapper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <WidgetWrapper>
          <ErrorMessage>{error}</ErrorMessage>
          <CloseButton onClick={onClose}>Fechar</CloseButton>
        </WidgetWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <WidgetWrapper>
        <CloseButton onClick={onClose} aria-label="Fechar widget">
          ×
        </CloseButton>
        {connectToken &&
          React.createElement('pluggy-connect', {
            connectToken,
            onSuccess: handleSuccess,
            onError: handleError,
            language: 'pt',
          })}
      </WidgetWrapper>
    </Container>
  );
};

export default ConnectBank;
