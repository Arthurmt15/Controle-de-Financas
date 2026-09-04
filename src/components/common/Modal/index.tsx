/**
 * @file components/common/Modal/index.tsx
 * @description Componente Modal reutilizável com overlay e animações.
 * Suporta diferentes tamanhos, fecha com ESC ou clique fora.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import Icon from '../Icon';
import * as C from './styles';
import type { ModalProps } from '../../../types';

/**
 * Componente Modal reutilizável
 * @param {ModalProps} props - Props do componente
 * @returns {JSX.Element | null} Componente Modal ou null se fechado
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  /** Ref para controle de foco */
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /** Fecha o modal com a tecla ESC */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  /** Gerencia o foco quando o modal abre/fecha */
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.focus(), 0);
      document.body.style.overflow = 'hidden';
    } else {
      previousFocusRef.current?.focus();
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  /** Adiciona listener para tecla ESC */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /** Lida com clique no overlay */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <C.Overlay
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <C.ModalContainer
        ref={modalRef}
        size={size}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <C.Header>
          <C.Title id="modal-title">{title}</C.Title>
          <C.CloseButton onClick={onClose} aria-label="Fechar modal" type="button">
            <Icon size={24}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </Icon>
          </C.CloseButton>
        </C.Header>
        <C.Content>{children}</C.Content>
      </C.ModalContainer>
    </C.Overlay>
  );
};

export default Modal;
