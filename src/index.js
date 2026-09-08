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
  if (typeof args[0] === 'string' && args[0].includes('accounts.google.com/gsi/log')) return;
  originalConsoleError(...args);
};

// Obtém o elemento raiz do DOM
const container = document.getElementById('root');

// Cria a raiz do React 18
const root = createRoot(container);

// Renderiza a aplicação
root.render(<App />);
