/**
 * @file components/common/Modal/index.tsx
 * @description Componente Modal reutilizável com overlay e animações.
 * Suporta diferentes tamanhos, fecha com ESC ou clique fora.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import * as C from './styles';
import type { ModalProps } from '../../../types';

/**
 * Componente Modal reutilizável
 * @param {ModalProps} props - Props do componente
 * @returns {JSX.Element | null} Componente Modal ou null se fechado
 *
 * @example
 * // Modal básico
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Título">
 *   <p>Conteúdo do modal</p>
 * </Modal>
 *
 * @example
 * // Modal grande sem fechar ao clicar fora
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar exclusão"
 *   size="lg"
 *   closeOnOverlayClick={false}
 * >
 *   <p>Tem certeza que deseja excluir?</p>
 * </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  // Ref para controle de foco
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Fecha o modal com a tecla ESC
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  /**
   * Gerencia o foco quando o modal abre/fecha
   */
  useEffect(() => {
    if (isOpen) {
      // Salva o elemento que estava focado
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Foca no modal após renderizar
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // Previne scroll do body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaura o foco ao elemento anterior
      previousFocusRef.current?.focus();

      // Restaura scroll do body
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * Adiciona listener para tecla ESC
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Lida com clique no overlay
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Não renderiza se fechado
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
        {/* Cabeçalho do modal */}
        <C.Header>
          <C.Title id="modal-title">{title}</C.Title>
          <C.CloseButton
            onClick={onClose}
            aria-label="Fechar modal"
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </C.CloseButton>
        </C.Header>

        {/* Conteúdo do modal */}
        <C.Content>{children}</C.Content>
      </C.ModalContainer>
    </C.Overlay>
  );
};

export default Modal;
