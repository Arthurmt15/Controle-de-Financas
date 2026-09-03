/**
 * @file hooks/useKeyboardNavigation.ts
 * @description Hook para navegação por teclado em componentes.
 * Implementa padrões de acessibilidade WAI-ARIA.
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Configuração de navegação por teclado
 */
interface UseKeyboardNavigationOptions {
  /** Callback ao pressionar Escape */
  onEscape?: () => void;
  /** Callback ao pressionar Enter */
  onEnter?: () => void;
  /** Callback ao pressionar seta para cima */
  onArrowUp?: () => void;
  /** Callback ao pressionar seta para baixo */
  onArrowDown?: () => void;
  /** Callback ao pressionar seta para esquerda */
  onArrowLeft?: () => void;
  /** Callback ao pressionar seta para direita */
  onArrowRight?: () => void;
  /** Callback ao pressionar Tab */
  onTab?: () => void;
  /** Se deve prevenir comportamento padrão */
  preventDefault?: boolean;
}

/**
 * Hook para navegação por teclado
 * @param {UseKeyboardNavigationOptions} options - Opções de configuração
 *
 * @example
 * useKeyboardNavigation({
 *   onEscape: () => closeModal(),
 *   onArrowDown: () => selectNextItem(),
 *   onArrowUp: () => selectPreviousItem(),
 * });
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    preventDefault = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  /**
   * Lida com o evento de tecla
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (onEscape) {
            if (preventDefault) e.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          if (onEnter) {
            if (preventDefault) e.preventDefault();
            onEnter();
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            if (preventDefault) e.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            if (preventDefault) e.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            if (preventDefault) e.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            if (preventDefault) e.preventDefault();
            onArrowRight();
          }
          break;
        case 'Tab':
          if (onTab) {
            onTab();
          }
          break;
      }
    },
    [onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, preventDefault]
  );

  // Adiciona listener ao elemento focado
  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return elementRef;
}

/**
 * Hook para trap de foco em modais
 * Mantém o foco dentro do modal quando aberto
 *
 * @example
 * const trapRef = useFocusTrap(isModalOpen);
 * <div ref={trapRef}>Conteúdo do modal</div>
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Foca no primeiro elemento
    firstElement.focus();

    /**
     * Gerencia o Tab para manter foco dentro do container
     */
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: vai para o último elemento se estiver no primeiro
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: vai para o primeiro elemento se estiver no último
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    return () => container.removeEventListener('keydown', handleTab);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook para atalhos de teclado globais
 * Escuta eventos de tecla em toda a aplicação
 *
 * @example
 * useGlobalKeyboardShortcuts({
 *   'ctrl+k': () => openSearch(),
 *   'ctrl+n': () => openNewTransaction(),
 * });
 */
export function useGlobalKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    /**
     * Lida com atalhos de teclado
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Constrói a string do atalho
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      parts.push(e.key.toLowerCase());
      const shortcut = parts.join('+');

      // Verifica se o atalho existe e executa
      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export default useKeyboardNavigation;
