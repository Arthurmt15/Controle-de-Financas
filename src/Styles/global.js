import { createGlobalStyle } from "styled-components";

const Global = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist:wght@500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { width: 100%; max-width: 100vw; overflow-x: hidden; }
  html { scrollbar-gutter: stable; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: ${({ theme }) => theme.type === 'dark'
      ? `radial-gradient(1200px 600px at 20% -10%, rgba(99,102,241,0.12), transparent 60%), radial-gradient(800px 400px at 90% 0%, rgba(6,182,212,0.08), transparent 50%), ${theme.colors.background}`
      : `radial-gradient(1000px 500px at 10% -10%, rgba(99,102,241,0.06), transparent 60%), ${theme.colors.background}`};
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  ::selection { background: ${({ theme }) => theme.colors.primary}22; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.border}; border-radius: 999px; }
  ::-webkit-scrollbar-track { background: transparent; }
  h1,h2,h3 { font-family: 'Geist', 'Inter', sans-serif; letter-spacing: -0.02em; }
`;

export default Global;
