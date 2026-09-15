import { createGlobalStyle } from "styled-components";

const Global = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist:wght@500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { width: 100%; max-width: 100vw; overflow-x: hidden; }
  html { scrollbar-gutter: stable; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: ${({ theme }) => theme.type === 'dark'
      ? `radial-gradient(1100px 500px at 15% -10%, rgba(99,102,241,0.10), transparent 55%), radial-gradient(900px 500px at 85% -5%, rgba(139,92,246,0.07), transparent 50%), radial-gradient(600px 400px at 50% 0%, rgba(6,182,214,0.05), transparent 60%), ${theme.colors.background}`
      : `radial-gradient(1000px 500px at 10% -12%, rgba(99,102,241,0.06), transparent 60%), radial-gradient(800px 400px at 90% 0%, rgba(6,182,214,0.04), transparent 55%), ${theme.colors.background}`};
    background-attachment: fixed;
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.35s ease, color 0.3s ease;
  }
  ::selection { 
    background: ${({ theme }) => theme.type === 'dark' ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.18)'}; 
  }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { 
    background: ${({ theme }) => theme.type === 'dark' ? 'rgba(148,163,184,0.18)' : theme.colors.border}; 
    border-radius: 999px; 
    border: 2px solid ${({ theme }) => theme.colors.background};
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.type === 'dark' ? 'rgba(148,163,184,0.28)' : '#cbd5e1'};
  }
  h1,h2,h3 { font-family: 'Geist', 'Inter', sans-serif; letter-spacing: -0.02em; }
  /* Garante que inputs/selects respeitem dark */
  input, textarea, select {
    color-scheme: ${({ theme }) => theme.type};
  }
`;

export default Global;
