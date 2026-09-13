/**
 * @file src/types/global.d.ts
 * @description Declarações de tipos globais para a aplicação.
 * Inclui tipos para Google Identity Services.
 */

/** Declaração de tipo para Google Identity Services */
interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (parent: HTMLElement, config: object) => void;
        disableAutoSelect: () => void;
      };
    };
  };
}
