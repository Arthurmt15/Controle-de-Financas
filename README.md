# 💰 Finanças - Controle Financeiro Pessoal

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Styled Components](https://img.shields.io/badge/Styled--Components-6.1.9-DB7093?style=flat-square&logo=styled-components&logoColor=white)](https://styled-components.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplicação web completa para controle financeiro pessoal, desenvolvida com React e TypeScript. Autenticação via Google OAuth, dashboards interativos e design responsivo.

---

## 📸 Screenshots

### Login com Google
![Login](./screenshots/login.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Transações
![Transações](./screenshots/transactions.png)

### Dark Mode
![Dark Mode](./screenshots/dark-mode.png)

---

## 🚀 Funcionalidades

### Autenticação
- ✅ Login com Google OAuth (seguro e rápido)
- ✅ Sessão persistente no localStorage
- ✅ Logout seguro com limpeza de dados

### Dashboard
- ✅ Cards de métricas (entradas, saídas, saldo mensal/anual)
- ✅ Gráfico de barras com evolução mensal (últimos 6 meses)
- ✅ Gráfico de pizza com despesas por categoria

### Transações
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Formulário com validação
- ✅ Edição de transações existentes
- ✅ Confirmação antes de excluir

### Filtros e Busca
- ✅ Busca por descrição
- ✅ Filtro por tipo (entrada/saída)
- ✅ Filtro por categoria
- ✅ Ordenação por data, valor ou descrição

### Categorias
- ✅ 10 categorias padrão pré-configuradas
- ✅ Cores e ícones para cada categoria
- ✅ Categorias para entradas e saídas

### Tema
- ✅ Modo claro e escuro
- ✅ Alternância instantânea
- ✅ Preferência persistida no localStorage

### UX/UI
- ✅ Design responsivo (mobile-first)
- ✅ Animações suaves
- ✅ Componentes acessíveis (ARIA labels)
- ✅ Feedback visual em todas as ações

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| React | 18.3.1 | Biblioteca de UI |
| TypeScript | 5.3.3 | Tipagem estática |
| Styled Components | 6.1.9 | Estilização CSS-in-JS |
| React Router | 6.x | Navegação (rotas) |
| Recharts | 2.x | Gráficos e visualizações |
| Google OAuth | - | Autenticação |
| ESLint | - | Análise de código |
| Prettier | - | Formatação de código |

---

## 📁 Estrutura do Projeto

```
├── src/                          # Frontend React
│   ├── components/
│   │   ├── common/               # Componentes reutilizáveis
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Select/
│   │   ├── features/             # Componentes de funcionalidades
│   │   │   ├── Dashboard/        # Dashboard com gráficos
│   │   │   ├── OpenFinance/      # Integração Open Finance Brasil
│   │   │   ├── TransactionForm/
│   │   │   ├── TransactionList/
│   │   │   ├── Analysis/         # Análise financeira
│   │   │   ├── BudgetManager/    # Gerenciamento de orçamentos
│   │   │   ├── CategoryManager/
│   │   │   └── FinancialAdvisor/ # Consultor IA
│   │   └── layout/
│   │       └── Header/
│   ├── contexts/                 # Contextos React
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── TransactionsContext.tsx
│   │   └── OpenFinanceContext.tsx
│   ├── hooks/                    # Hooks customizados
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── Analysis/
│   │   ├── Settings/
│   │   └── OpenFinance/
│   ├── services/                 # Serviços de API
│   │   ├── api.ts
│   │   ├── openFinanceService.ts
│   │   ├── financialAdvisorService.ts
│   │   └── ocrService.ts
│   ├── types/                    # Definições TypeScript
│   └── utils/                    # Funções utilitárias
│
├── server/                       # Backend Express
│   └── src/
│       ├── routes/               # Rotas da API
│       ├── middleware/           # Middlewares (auth)
│       ├── services/             # Serviços (Pluggy API)
│       ├── types/                # Tipos TypeScript
│       └── database.ts           # Conexão PostgreSQL
│
└── .github/workflows/            # CI/CD
    └── ci.yml
```

---

## 🏗️ Arquitetura e Boas Práticas

### Estado Global
- **Context API** para gerenciamento de estado global
- **useReducer** para ações complexas de estado
- **Persistência** automática no localStorage

### Componentização
- Componentes pequenos e reutilizáveis
- Separação por responsabilidade (components, pages, features)
- Props bem definidas com TypeScript

### Performance
- **useMemo** para valores computados
- **useCallback** para funções memoizadas
- Code splitting por rotas

### Acessibilidade
- Labels ARIA em todos os componentes
- Navegação por teclado
- Contraste de cores adequado
- Feedback para leitores de tela

### Código Limpo
- ESLint + Prettier configurados
- Comentários JSDoc em todas as funções
- Nomes semânticos e descritivos
- Funções puras e pequenas

---

## 📋 Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase (conta gratuita)
- Conta Google Cloud Platform (para OAuth)
- Conta Pluggy (para Open Finance, opcional)

---

## ⚙️ Configuração

### 1. Instale as dependências

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Configure as variáveis de ambiente

**Frontend (`.env`):**
```env
REACT_APP_GOOGLE_CLIENT_ID=seu-client-id-aqui
REACT_APP_USE_SUPABASE=false
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon
REACT_APP_API_URL=http://localhost:5000/api
```

**Backend (`server/.env`):**
```env
DATABASE_URL=sua_url_do_banco
JWT_SECRET=sua_chave_secreta_aqui
GROQ_API_KEY=sua_chave_groq_aqui
PLUGGY_CLIENT_ID=seu_client_id_pluggy
PLUGGY_CLIENT_SECRET=seu_client_secret_pluggy
FRONTEND_URL=http://localhost:3000
```

### 3. Execute o projeto

```bash
# Frontend e Backend juntos
npm run dev

# Ou separadamente:
npm start          # Frontend (porta 3000)
npm run start:server  # Backend (porta 5000)
```

---

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `build/`.

---

## 🧪 Testes e Qualidade

```bash
npm test              # Executa testes
npm run test:coverage # Testes com cobertura
npm run lint          # Verifica lint
npm run lint:fix      # Corrige problemas de lint
npm run format        # Formata código com Prettier
npm run format:check  # Verifica formatação
npm run typecheck     # Verifica tipos TypeScript
```

---

## 🚀 CI/CD

Pipeline automatizada com GitHub Actions:
- **Lint** - Verificação de código
- **Test** - Execução de testes unitários
- **Build** - Compilação para produção

Executa em cada push e pull request para a branch `main`.

---

## 📝 Commits

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação (não afeta o código)
- `refactor:` refatoração
- `test:` adição de testes
- `chore:` tarefas de manutenção

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Arthur Oliveira**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/seu-perfil)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/seu-usuario)

---

## 🎯 O que foi demonstrado neste projeto

### Habilidades Técnicas
- ✅ React 18 com Hooks avançados
- ✅ TypeScript para tipagem estática
- ✅ Context API + useReducer para estado global
- ✅ Styled Components para estilização
- ✅ Integração com API externa (Google OAuth)
- ✅ Gráficos e visualização de dados
- ✅ Validação de formulários
- ✅ Persistência de dados (localStorage)
- ✅ Design responsivo
- ✅ Acessibilidade (ARIA)
- ✅ Performance (memoização)

### Habilidades Soft
- ✅ Organização do código
- ✅ Documentação completa
- ✅ Nomenclatura semântica
- ✅ Commits profissionais
- ✅ Arquitetura escalável

---

Feito com ❤️ para impressionar recrutadores!
