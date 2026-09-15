import styled from 'styled-components';

/**
 * Descrição da feature
 */
export const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

/**
 * Gráfico decorativo
 */
export const Chart = styled.div`
  position: relative;
  height: 180px;
  margin-top: 50px;
  overflow: hidden;
`;

/**
 * Barras do gráfico
 */
export const Bars = styled.div`
  position: absolute;
  bottom: 0;
  left: 20px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 100%;
`;

/**
 * Barra individual
 */
export const Bar = styled.span<{ $height: string }>`
  width: 28px;
  height: ${({ $height }) => $height};
  background: linear-gradient(to top, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.45));
  border-radius: 4px 4px 0 0;
`;

/**
 * Linha do gráfico
 */
export const ChartLine = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0;

  path {
    fill: none;
    stroke: ${({ theme }) => theme.colors.success};
    stroke-width: 3;
    filter: drop-shadow(0 0 8px ${({ theme }) => `${theme.colors.success}66`});
  }
`;

/**
 * Seção de login (lado direito)
 */
export const LoginSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;

  @media (max-width: 900px) {
    min-height: 100vh;
    padding: 25px 18px;
  }

  @media (max-width: 480px) {
    padding: 15px;
  }
`;

/**
 * Card do login
 */
export const LoginCard = styled.div`
  width: 100%;
  max-width: 520px;
  padding: 48px 42px;
  background: ${({ theme }) =>
    theme.type === 'dark'
      ? `linear-gradient(145deg, rgba(16, 21, 34, 0.96), rgba(8, 12, 21, 0.98))`
      : `linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.98))`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  box-shadow: 0 30px 80px ${({ theme }) => `${theme.colors.shadow}`};

  @media (max-width: 900px) {
    max-width: 480px;
    padding: 38px 25px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 32px 20px;
    border-radius: 16px;
    border: none;
    box-shadow: none;
    background: transparent;
  }
`;

/**
 * Toggle de tema
 */
export const ThemeButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

/**
 * Cabeçalho do login
 */
export const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 35px;

  @media (max-width: 480px) {
    margin-bottom: 30px;
  }
`;

/**
 * Título do login
 */
export const Title = styled.h2`
  font-size: 30px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 900px) {
    font-size: 25px;
  }

  @media (max-width: 480px) {
    font-size: 23px;
  }
`;

/**
 * Subtítulo do login
 */
export const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 15px;
`;

/**
 * Botão do Google
 */
export const GoogleButton = styled.button`
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: none;
  border-radius: 9px;
  background: #fff;
  color: #111827;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  }

  @media (max-width: 480px) {
    height: 52px;
  }
`;
