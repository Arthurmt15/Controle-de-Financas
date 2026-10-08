/**
 * @file utils/lazyWithRetry.ts
 * @description Wrapper de React.lazy com retry e auto-reload para ChunkLoadError.
 * Quando um deploy novo vai ao ar, abas antigas tentam carregar chunks com hash
 * que já não existem (ex.: 744.85f3b8b3.chunk.js) e quebram com ChunkLoadError.
 * Este helper tenta o import novamente e, em falha típica de chunk/deploy,
 * recarrega a página uma única vez (flag em sessionStorage evita loop).
 */

import React from 'react';

const RELOAD_FLAG = 'chunk-reload-done';

function isChunkError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  return (
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk [\w-]+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
}

/**
 * React.lazy com tolerância a chunks obsoletos após deploy.
 * @param importer - função () => import('./pages/X')
 * @param retries - tentativas extras antes de recarregar (padrão: 2)
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  retries = 2
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        // Cache-buster leve na repetição para furar cache de CDN/proxy
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }
        return await importer();
      } catch (err) {
        lastError = err;
        if (!isChunkError(err)) break;
      }
    }
    // Chunk quebrou mesmo após retries: provavelmente deploy novo → recarrega 1x
    try {
      if (isChunkError(lastError) && sessionStorage.getItem(RELOAD_FLAG) !== '1') {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      }
    } catch {
      // sessionStorage indisponível (modo privado) — segue para o erro abaixo
    }
    throw lastError;
  });
}

/** Limpa a flag de reload (chamado no boot do App após carregar com sucesso). */
export function clearChunkReloadFlag(): void {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    // ignora — sessionStorage pode estar indisponível
  }
}
