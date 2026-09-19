/**
 * @file components/common/ErrorBoundary
 * @description Error Boundary para capturar erros de renderização e evitar tela branca.
 */
import React from 'react';
import styled from 'styled-components';

const FallbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.text || '#374151'};
`;

const RetryButton = styled.button`
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #4f46e5;
  }
`;

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary capturou erro:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <FallbackContainer role="alert">
          <h2>Algo deu errado</h2>
          <p>Ocorreu um erro inesperado. Tente recarregar a página.</p>
          {this.state.error && (
            <pre
              style={{
                marginTop: 12,
                fontSize: 12,
                color: '#6b7280',
                maxWidth: 600,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <RetryButton onClick={this.handleReset}>Recarregar</RetryButton>
        </FallbackContainer>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
