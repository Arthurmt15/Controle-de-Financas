/**
 * @file index.js
 * @description Ponto de entrada da aplicação React.
 * Renderiza o componente raiz no DOM.
 */

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Suprime erros CORS do Google Identity Services (gsi/log é analytics interno do Google, inofensivo)
const GSI_KEYWORDS = ['gsi/log', 'gsi/', 'cross-origin', 'cross origin', 'CORS', 'Requisição cross-origin'];

function isGsiError(...args) {
  return args.some(arg =>
    typeof arg === 'string' && GSI_KEYWORDS.some(kw => arg.includes(kw))
  );
}

// Intercepta todos os métodos do console
['error', 'warn', 'log', 'info'].forEach(method => {
  const original = console[method].bind(console);
  console[method] = (...args) => {
    if (isGsiError(...args)) return;
    original(...args);
  };
});

// Intercepta erros não capturados no window
window.addEventListener('error', (event) => {
  if (isGsiError(event.message, event.filename || '')) {
    event.preventDefault();
    return true;
  }
});

// Intercepta promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  const r = event.reason;
  if (
    isGsiError(
      typeof r === 'string' ? r : '',
      r?.message || '',
      r?.stack || ''
    )
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
