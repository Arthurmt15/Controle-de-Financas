/**
 * @file pages/Login/styles.ts
 * @description Estilos da página de Login com layout split.
 */

import styled from 'styled-components';

/**
 * Container da página com layout split
 */
export const Container = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${({ theme }) =>
    theme.type === 'dark'
      ? `radial-gradient(circle at 10% 80%, rgba(99, 102, 241, 0.16), transparent 25%),
         linear-gradient(135deg, #0f0f23, #080b16)`
      : `radial-gradient(circle at 10% 80%, rgba(99, 102, 241, 0.1), transparent 25%),
         linear-gradient(135deg, #f5f5f5, #e8e8e8)`};
`;

/**
 * Seção hero (lado esquerdo)
 */
export const Hero = styled.section`
  display: flex;
  align-items: center;
  padding: 80px 8%;

  @media (max-width: 900px) {
    display: none;
  }
`;

/**
 * Conteúdo do hero
 */
export const HeroContent = styled.div`
  width: 100%;
  max-width: 560px;
`;

/**
 * Logo com gradiente
 */
export const Logo = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(145deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  box-shadow: 0 0 35px ${({ theme }) => `${theme.colors.primary}59`};
  margin-bottom: 35px;
`;

/**
 * Ícone do logo
 */
export const LogoIcon = styled.span`
  font-size: 34px;
  font-weight: 700;
  color: white;
`;

/**
 * Título do hero
 */
export const HeroTitle = styled.h1`
  font-size: clamp(42px, 4vw, 64px);
  line-height: 1.08;
  letter-spacing: -2px;
  margin-bottom: 25px;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Texto com gradiente
 */
export const GradientText = styled.strong`
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.secondary}, ${({ theme }) => theme.colors.info});
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
`;

/**
 * Descrição do hero
 */
export const HeroDescription = styled.p`
  max-width: 500px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  line-height: 1.7;
  margin-bottom: 45px;
`;

/**
 * Lista de features
 */
export const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

/**
 * Item de feature
 */
export const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

/**
 * Ícone da feature
 */
export const FeatureIcon = styled.div<{ $color: 'purple' | 'blue' | 'green' }>`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  ${({ $color }) =>
    $color === 'purple' &&
    `
    color: #a855f7;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid rgba(168, 85, 247, 0.25);
  `}
  ${({ $color }) =>
    $color === 'blue' &&
    `
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.25);
  `}
  ${({ $color }) =>
    $color === 'green' &&
    `
    color: #00d9b5;
    background: rgba(0, 217, 181, 0.08);
    border: 1px solid rgba(0, 217, 181, 0.25);
  `}
`;

/**
 * Título da feature
 */
export const FeatureTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.text};
`;

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

/**
 * Ícone do Google
 */
export const GoogleIcon = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #4285f4;
`;

/**
 * Divisor
 */
export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 28px 0;
`;

/**
 * Linha do divisor
 */
export const DividerLine = styled.span`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
`;

/**
 * Texto do divisor
 */
export const DividerText = styled.small`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

/**
 * Grupo de formulário
 */
export const FormGroup = styled.div`
  margin-bottom: 22px;
`;

/**
 * Label do formulário
 */
export const Label = styled.label`
  display: block;
  margin-bottom: 9px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Input do formulário
 */
export const Input = styled.input`
  width: 100%;
  height: 54px;
  padding: 0 16px;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 9px;
  outline: none;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  font-size: 14px;
  transition: 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}1f`};
  }

  @media (max-width: 480px) {
    height: 52px;
  }
`;

/**
 * Wrapper da senha
 */
export const PasswordWrapper = styled.div`
  position: relative;
`;

/**
 * Botão mostrar senha
 */
export const ShowPasswordButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
`;

/**
 * Opções do formulário
 */
export const FormOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  font-size: 13px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

/**
 * Checkbox de lembrar
 */
export const RememberLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

/**
 * Link de esqueceu senha
 */
export const ForgotPassword = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

/**
 * Botão de login
 */
export const LoginButton = styled.button`
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primaryHover}, ${({ theme }) => theme.colors.primary});
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px ${({ theme }) => `${theme.colors.primary}59`};
  }

  @media (max-width: 480px) {
    height: 52px;
  }
`;

/**
 * Link de registro
 */
export const RegisterLink = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      color: ${({ theme }) => theme.colors.text};
    }
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
  }
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
  margin-bottom: 16px;
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
 * Container do botão Google (renderizado pelo Google)
 */
export const GoogleButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  > div {
    width: 100% !important;

    > div {
      width: 100% !important;
    }
  }
`;
