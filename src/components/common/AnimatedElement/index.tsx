/**
 * @file components/common/AnimatedElement/index.tsx
 * @description Componente wrapper para animações com Framer Motion.
 * Fornece animações reutilizáveis para entrada, saída e transições.
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

/**
 * Variantes de animação pré-definidas
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Props do componente AnimatedElement
 */
interface AnimatedElementProps {
  children: React.ReactNode;
  /** Variante de animação */
  variant?: 'fade' | 'slideUp' | 'slideDown' | 'scale';
  /** Duração da animação em segundos */
  duration?: number;
  /** Delay antes de iniciar (segundos) */
  delay?: number;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Mapeamento de variantes
 */
const variantMap = {
  fade: fadeVariants,
  slideUp: slideUpVariants,
  slideDown: slideDownVariants,
  scale: scaleVariants,
};

/**
 * Componente wrapper para animações
 * @param {AnimatedElementProps} props - Props do componente
 * @returns {JSX.Element} Elemento animado
 *
 * @example
 * <AnimatedElement variant="slideUp" duration={0.5}>
 *   <MeuComponente />
 * </AnimatedElement>
 */
const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  variant = 'fade',
  duration = 0.3,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      variants={variantMap[variant]}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Lista animada com stagger (itens aparecem um após o outro)
 */
export const AnimatedList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  );
};

/**
 * Item animado para uso dentro de AnimatedList
 */
export const AnimatedListItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
};

export default AnimatedElement;
