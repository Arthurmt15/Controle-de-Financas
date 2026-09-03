/**
 * @file pages/Login/styles.ts
 * @description Estilos da página de Login.
 */

import styled from 'styled-components';

/**
 * Container da página
 */
export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

/**
 * Card do formulário
 */
export const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

/**
 * Botão de toggle de tema
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
 * Logo
 */
export const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

/**
 * Ícone do logo
 */
export const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  border-radius: 20px;
  margin-bottom: 16px;
`;

/**
 * Texto do logo
 */
export const LogoText = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Título
 */
export const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin: 0 0 8px 0;
`;

/**
 * Subtítulo
 */
export const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 32px 0;
`;

/**
 * Formulário
 */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/**
 * Mensagem de erro
 */
export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: ${({ theme }) => `${theme.colors.error}15`};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  text-align: center;
`;

/**
 * Ícone de erro
 */
export const ErrorIcon = styled.span`
  font-size: 16px;
`;

/**
 * Botão de fechar erro
 */
export const ErrorClose = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  line-height: 1;

  &:hover {
    opacity: 0.7;
  }
`;

/**
 * Seção do Google
 */
export const GoogleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

/**
 * Container do botão Google
 */
export const GoogleButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

/**
 * Texto fallback
 */
export const FallbackText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

/**
 * Informações de segurança
 */
export const SecurityInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background-color: ${({ theme }) => `${theme.colors.success}10`};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: 24px;
`;

/**
 * Ícone de segurança
 */
export const SecurityIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;
`;

/**
 * Texto de segurança
 */
export const SecurityText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

/**
 * Lista de funcionalidades
 */
export const Features = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

/**
 * Item de funcionalidade
 */
export const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Ícone de funcionalidade
 */
export const FeatureIcon = styled.span`
  font-size: 20px;
`;

/**
 * Dica de login
 */
export const Hint = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius};
  text-align: center;
`;

/**
 * Título da dica
 */
export const HintTitle = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Texto da dica
 */
export const HintText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  font-family: monospace;
`;
