/**
 * @file index.js
 * @description Ponto de entrada da aplicação React.
 * Renderiza o componente raiz no DOM.
 */

import { createRoot } from 'react-dom/client';
import App from './App';

// Obtém o elemento raiz do DOM
const container = document.getElementById('root');

// Cria a raiz do React 18
const root = createRoot(container);

// Renderiza a aplicação
root.render(<App />);
