/** Declaração de tipo para Google Identity Services */
interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
        renderButton: (parent: HTMLElement, config: object) => void;
        disableAutoSelect: () => void;
      };
    };
  };
}
