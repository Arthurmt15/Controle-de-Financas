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
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
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
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.secondary},
    ${({ theme }) => theme.colors.info}
  );
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
