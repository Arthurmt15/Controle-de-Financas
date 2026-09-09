/**
 * @file index.js
 * @description Ponto de entrada da aplicação React.
 * Renderiza o componente raiz no DOM.
 */

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Suprime erros CORS do Google Identity Services (gsi/log é analytics interno do Google, inofensivo)
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.some(arg => typeof arg === 'string' && arg.includes('accounts.google.com/gsi/log'))) return;
  if (args.some(arg => typeof arg === 'string' && arg.includes('Requisição cross-origin bloqueada'))) return;
  originalConsoleError(...args);
};

// Suprime erros de rede do Google GSI (CORS em endpoints de analytics)
window.addEventListener('error', (event) => {
  if (event.filename?.includes('accounts.google.com/gsi/')) {
    event.preventDefault();
    return true;
  }
});

// Suprime promises rejeitadas do Google GSI
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (
    (typeof reason === 'string' && reason.includes('accounts.google.com/gsi/')) ||
    (reason?.message && reason.message.includes('Failed to fetch'))
  ) {
    event.preventDefault();
  }
});

// Obtém o elemento raiz do DOM
const container = document.getElementById('root');

// Cria a raiz do React 18
const root = createRoot(container);

// Renderiza a aplicação
root.render(<App />);
