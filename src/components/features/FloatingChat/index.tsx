/**
 * @file components/features/FloatingChat/index.tsx
 * @description Chat flutuante único (guia do site) que unifica Chat Rápido + Consultor Financeiro.
 * Fica fixo no canto inferior direito em todas as páginas autenticadas.
 * Reutiliza pipeline completo de TransactionChat (comandos, transações, parcelados, dívidas, IA)
 * + welcome/sugestões do FinancialAdvisor, com scroll interno dinâmico.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Bot, MessageCircle, Send, X, User } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useInstallments } from '../../../contexts/InstallmentsContext';
import { useDebts } from '../../../contexts/DebtsContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { parseTransactionFromMessage } from '../../../utils/parseTransaction';
import { detectCommand, executeCommand } from '../../../utils/chatCommands';
import { playSound } from '../../../utils/sounds';
import { generateSummary, generateAnalysis } from '../../../utils/analysisEngine';
import { buildFinancialContext, streamAdvisor } from '../../../services/financialAdvisorService';
import { parseCurrencyInput } from '../../../utils/parseCurrency';
import { renderSafeMarkdown } from '../../../utils/safeMarkdown';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import type { Transaction } from '../../../types';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  transaction?: Transaction;
}

type ChatMode = 'quick-entry' | 'advisor';

const SUGGESTIONS_GUIDE = ['Como lançar despesa?', 'Meu saldo este mês'];

const FloatingChat: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    categories,
    recurringBills,
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    generateRecurringTransactions,
  } = useTransactions();
  const { addInstallment } = useInstallments();
  const { addDebt } = useDebts();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<ChatMode>('quick-entry');
  const [quickType, setQuickType] = useState<'expense' | 'income'>('expense');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickFeedback, setQuickFeedback] = useState<string | null>(null);
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = `financas_floating_chat_${user?.id ?? 'anon'}`;

  // Não mostra em /login
  const isLogin = location.pathname === '/login';

  // Auto-scroll dinâmico
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: isProcessing ? 'smooth' : 'auto' });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (isProcessing) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isProcessing]);

  // Abre via evento custom (para placeholders em Transactions/Analysis)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-floating-chat', handler);
    return () => window.removeEventListener('open-floating-chat', handler);
  }, []);

  // Foca input e começa no final (parte de baixo) ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // garante que o chat comece na parte de baixo (última mensagem visível sem scroll da página)
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
      setTimeout(() => {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
        endRef.current?.scrollIntoView({ block: 'end' });
      }, 150);
    }
  }, [isOpen]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (chatRef.current?.contains(target) || fabRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Carrega histórico do usuário atual ou welcome
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) })));
          return;
        }
      }
    } catch {}
    setMessages([
      {
        id: 'welcome',
        text: 'Posso responder perguntas sobre suas finanças. Para cadastrar um lançamento, use a aba **Lançar**.',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, STORAGE_KEY]);

  const dynamicFollowUps = useMemo(() => {
    if (isProcessing) return [];
    const last = messages[messages.length - 1];
    if (!last || last.isUser) return [];
    const txt = last.text.toLowerCase();
    if (/transa[çc][aã]o registrada/.test(txt)) return ['Ver saldo', 'Gastos do mês'];
    if (/d[uú]vida|2000|quanto posso|plano|parcel|dívida|investir|gastos|saldo/.test(txt)) {
      return ['Registrar despesa', 'Quanto posso gastar?'];
    }
    return [];
  }, [messages, isProcessing]);

  // Atalhos resumidos: mostra follow-ups se houver, senão 2-3 guias essenciais
  const visibleShortcuts = useMemo(() => {
    if (dynamicFollowUps.length > 0) return dynamicFollowUps.slice(0, 2);
    return SUGGESTIONS_GUIDE.slice(0, 3);
  }, [dynamicFollowUps]);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = (text: string, isUser: boolean, transaction?: Transaction): ChatMessage => {
    const m: ChatMessage = {
      id: generateMessageId(),
      text,
      isUser,
      timestamp: new Date(),
      transaction,
    };
    setMessages((prev) => [...prev, m]);
    return m;
  };

  const processMessage = async (text: string) => {
    setIsProcessing(true);
    addMessage(text, true);

    // 1. Comandos locais (inclui help/guia)
    const command = detectCommand(text);
    if (command.type !== null) {
      const response = await executeCommand(
        command,
        categories,
        addCategory,
        deleteCategory,
        () => generateSummary(transactions, categories),
        () => generateAnalysis(transactions, categories),
        addRecurringBill,
        updateRecurringBill,
        deleteRecurringBill,
        generateRecurringTransactions,
        recurringBills,
        transactions,
        updateTransaction,
        deleteTransaction
      );
      // Comandos que alteram dados já tocam som no contexto; aqui só erro ou leitura
      if (/\berro\b/i.test(response)) playSound('error');
      else if (
        ['list_categories', 'summary', 'analysis', 'help', 'list_recurring'].includes(command.type)
      )
        playSound('receive');
      addMessage(response, false);
      setIsProcessing(false);
      return;
    }

    // 1b. Guia do site — perguntas sobre navegação vão para IA com contexto do site
    const lowerGuide = text.toLowerCase();
    const isGuideQuestion =
      /\b(onde|como|o que|quais|me mostre|me leva|guia|tutorial|usar|funciona).*\b(dashboard|transa[çc]|parcelad|d[ií]vida|gastos futuros|an[aá]lise|configura|categoria|consultor)/i.test(
        lowerGuide
      ) || /\b(o que posso fazer|como navego|me ajuda a usar)\b/i.test(lowerGuide);
    // isGuideQuestion também vai para IA, mas com contexto extra abaixo

    // 1c. Dúvida/pergunta clara → não tenta parsear como transação (inclui planejamento de investimento)
    const lowerForDoubt = text.toLowerCase();
    const isPlanningDoubt =
      /\b(pretendo|planejo|quero)\s+(investir|aplicar|guardar)\b/i.test(lowerForDoubt) ||
      /\bquanto.*ganho\b/i.test(lowerForDoubt) ||
      /\blucro\b.*%.*ao ano\b/i.test(lowerForDoubt);
    const isDoubtLike =
      isPlanningDoubt ||
      (/d[uú]vida|\?|posso\b|vale a pena|como\b.*\?|quanto posso|quanto ganho|me ajuda|me explica|estou com uma d|pretendo/.test(
        lowerForDoubt
      ) &&
        !/\b(comprei|paguei|gastei|mercado|supermercado|recebi|parcelado|investi|apliquei)\b/.test(
          lowerForDoubt
        ));
    if (isDoubtLike && !isGuideQuestion) {
      // vai direto para IA
    } else if (
      !isGuideQuestion ||
      /\b(R\$|reais|mercado|comprei|paguei|gastei|recebi)\b/i.test(lowerGuide)
    ) {
      // 2. Tentar parsear como transação (se não for só pergunta de guia)
      const parsed = parseTransactionFromMessage(text);
      if (parsed) {
        let matchCat = categories.find(
          (c) => c.name.toLowerCase() === parsed.categoria.toLowerCase()
        );
        if (!matchCat)
          matchCat = categories.find((c) => c.name.toLowerCase() === 'outros') || categories[0];
        if (matchCat) {
          const installmentCount = parsed.parcelas || 0;
          const isDivided = /\b(dividid[ao]|d[ií]vida|racha|compartilhad[ao])\b/i.test(text);
          const perInstallment =
            installmentCount > 0 ? parsed.valor / installmentCount : parsed.valor;
          const installmentLabel = installmentCount > 0 ? `1/${installmentCount}` : '';
          const descriptionWithInstallment = installmentLabel
            ? `${parsed.descricao} ${installmentLabel}`
            : parsed.descricao;
          const transactionData: Omit<Transaction, 'id'> = {
            description: descriptionWithInstallment + (isDivided ? ' [Dívida]' : ''),
            amount: perInstallment,
            type: parsed.tipo === 'despesa' ? 'expense' : 'income',
            date: new Date(parsed.data + 'T12:00:00').toISOString(),
            categoryId: matchCat.id,
            notes:
              installmentCount > 0
                ? `Parcelado em ${installmentCount}x - Total R$ ${parsed.valor.toFixed(2).replace('.', ',')}`
                : '',
          };
          await addTransaction(transactionData);
          if (installmentCount > 0) {
            try {
              await addInstallment({
                description: parsed.descricao,
                totalAmount: parsed.valor,
                installmentAmount: perInstallment,
                totalInstallments: installmentCount,
                currentInstallment: 1,
                startDate: parsed.data,
                categoryId: matchCat.id,
                notes: `Criado via chat - Total R$ ${parsed.valor.toFixed(2).replace('.', ',')} em ${installmentCount}x`,
                source: 'manual',
              });
            } catch {}
          }
          if (isDivided) {
            try {
              const parcels = installmentCount > 1 ? installmentCount : 1;
              await addDebt({
                description: parsed.descricao,
                totalAmount: parsed.valor,
                installmentAmount: parsed.valor / parcels,
                totalInstallments: parcels,
                currentInstallment: parcels > 1 ? 1 : 0,
                startDate: parsed.data,
                categoryId: matchCat.id,
                notes: `Criado via chat (dívida) - Total R$ ${parsed.valor.toFixed(2).replace('.', ',')} ${parcels > 1 ? `em ${parcels}x` : 'à vista'}`,
                source: 'manual',
              });
            } catch {}
          }
          const successMsg =
            ` Transação registrada!\n ${transactionData.description}\n R$ ${transactionData.amount.toFixed(2).replace('.', ',')}\n ${new Date(transactionData.date).toLocaleDateString('pt-BR')}\n ${matchCat.name}` +
            (installmentCount > 0
              ? `\n Total: R$ ${parsed.valor.toFixed(2).replace('.', ',')} (${installmentCount}x)`
              : '') +
            (isDivided ? `\n Dívida criada em Dívidas` : '');
          addMessage(successMsg, false);
          setIsProcessing(false);
          return;
        }
      }
    }

    // 3. IA — Consultor + Guia (streaming)
    const aiMsg: ChatMessage = {
      id: generateMessageId(),
      text: '',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    try {
      const financialContext = buildFinancialContext(transactions, categories);
      const siteGuide = `
GUIA DO SITE:
- Dashboard: visão geral, saldo, gráficos e atalho para Reserva
- Transações: lançar por chat ("almoço 25") ou formulário; parcelado/divida via chat ou formulário unificado
- Parcelados & Dívidas (/installments): lista unificada, métricas, próximo pagamento, avançar parcela; dívidas também aparecem aqui quando transação marcada como dívida
- Reserva de Emergência (/emergency-reserve): defina meta (sugestão 6x despesas), deposite/saque e acompanhe progresso
- Análise (/analysis): evolução mensal, insights, consultor
- Gastos Futuros: planejar despesas futuras
- Configurações: categorias, orçamentos
Responda como guia quando pergunta for sobre navegação.`;
      const context = financialContext + '\n' + siteGuide;
      const history = messages.slice(-20).map((m) => ({
        role: m.isUser ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));
      let accumulated = '';
      const chunks = streamAdvisor(text, context, history);
      const updateAiMessage = (t: string) =>
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: t } : m)));
      for await (const chunk of chunks) {
        accumulated += chunk;
        updateAiMessage(accumulated);
      }
      if (accumulated) playSound('receive');
    } catch {
      playSound('error');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id ? { ...m, text: 'Erro ao conectar com a IA. Tente novamente.' } : m
        )
      );
    }
    setIsProcessing(false);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;
    setInputValue('');
    playSound('send');
    processMessage(text);
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  const saveQuickEntry = async () => {
    const amount = parseCurrencyInput(quickAmount);
    if (!quickDescription.trim() || amount === null || amount <= 0) {
      setQuickFeedback('Informe uma descrição e um valor maior que zero.');
      return;
    }

    const category =
      categories.find((item) => item.name.toLowerCase() === 'outros') ??
      categories.find((item) => item.defaultType === quickType || item.defaultType === 'both');
    if (!category) {
      setQuickFeedback('Crie uma categoria antes de registrar o lançamento.');
      return;
    }

    setIsQuickSaving(true);
    setQuickFeedback(null);
    try {
      await addTransaction({
        description: quickDescription.trim(),
        amount,
        type: quickType,
        date: new Date().toISOString(),
        categoryId: category.id,
      });
      setQuickFeedback(
        `${quickType === 'expense' ? 'Gasto' : 'Entrada'} registrado em ${category.name}.`
      );
      setQuickDescription('');
      setQuickAmount('');
    } catch {
      setQuickFeedback('Não foi possível registrar o lançamento. Tente novamente.');
    } finally {
      setIsQuickSaving(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isLogin) return null;

  return (
    <>
      {/* FAB — cor acompanha accent do usuário */}
      <motion.button
        ref={fabRef}
        onClick={() => {
          playSound(isOpen ? 'click' : 'drawer');
          setIsOpen(!isOpen);
        }}
        style={!isOpen ? { backgroundColor: theme.colors.primary, color: 'white' } : undefined}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-white hover:opacity-90'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Fechar guia' : 'Abrir guia inteligente'}
        title={isOpen ? 'Fechar' : 'Guia Inteligente — pergunte qualquer coisa'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Janela */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-[76px] right-4 sm:right-6 z-[60] w-[360px] sm:w-[400px] max-w-[calc(100vw-32px)]"
          >
            <Card className="rounded-2xl overflow-hidden shadow-2xl border flex flex-col h-[520px] sm:h-[560px] max-h-[70vh] bg-card">
              <CardHeader
                className="p-3.5 border-b text-white shrink-0 flex flex-row items-center justify-between gap-2 space-y-0"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle className="text-[14px] font-semibold text-white leading-none flex items-center gap-1.5">
                      {mode === 'quick-entry' ? 'Lançamento rápido' : 'Pergunte ao guia'}
                    </CardTitle>
                    <p className="text-[11px] text-white/80 leading-none mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{' '}
                      {mode === 'quick-entry'
                        ? 'Registre em poucos segundos'
                        : 'Consultor financeiro'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <div className="grid grid-cols-2 gap-1.5 p-2 border-b bg-card">
                <Button
                  type="button"
                  variant={mode === 'quick-entry' ? 'default' : 'ghost'}
                  className="h-8 rounded-lg gap-1.5 text-xs"
                  onClick={() => setMode('quick-entry')}
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" /> Lançar
                </Button>
                <Button
                  type="button"
                  variant={mode === 'advisor' ? 'default' : 'ghost'}
                  className="h-8 rounded-lg gap-1.5 text-xs"
                  onClick={() => setMode('advisor')}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Perguntar
                </Button>
              </div>

              {mode === 'quick-entry' ? (
                <div className="flex-1 p-4 bg-muted/20">
                  <p className="text-sm font-medium">O que aconteceu?</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    A categoria fica como Outros e pode ser ajustada depois.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      type="button"
                      variant={quickType === 'expense' ? 'default' : 'outline'}
                      className="gap-2"
                      onClick={() => setQuickType('expense')}
                    >
                      <ArrowDownLeft className="h-4 w-4" /> Gasto
                    </Button>
                    <Button
                      type="button"
                      variant={quickType === 'income' ? 'default' : 'outline'}
                      className="gap-2"
                      onClick={() => setQuickType('income')}
                    >
                      <ArrowUpRight className="h-4 w-4" /> Entrada
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <Input
                      value={quickDescription}
                      onChange={(event) => setQuickDescription(event.target.value)}
                      placeholder="Ex.: almoço, salário, gasolina"
                      aria-label="Descrição do lançamento"
                      disabled={isQuickSaving}
                    />
                    <Input
                      value={quickAmount}
                      onChange={(event) => setQuickAmount(event.target.value)}
                      inputMode="decimal"
                      placeholder="Valor, ex.: 42,50"
                      aria-label="Valor do lançamento"
                      disabled={isQuickSaving}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveQuickEntry();
                      }}
                    />
                    <Button className="w-full" onClick={saveQuickEntry} disabled={isQuickSaving}>
                      {isQuickSaving
                        ? 'Registrando...'
                        : `Registrar ${quickType === 'expense' ? 'gasto' : 'entrada'}`}
                    </Button>
                    {quickFeedback && (
                      <p className="rounded-lg bg-card border px-3 py-2 text-xs">{quickFeedback}</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    ref={scrollRef}
                    role="log"
                    aria-live="polite"
                    aria-label="Mensagens do guia"
                    className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-3 bg-muted/20 scroll-smooth"
                  >
                    {messages.map((message, idx) => {
                      const isTyping = !message.isUser && isProcessing && !message.text;
                      const isStreaming =
                        !message.isUser &&
                        isProcessing &&
                        !!message.text &&
                        idx === messages.length - 1;
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.01 }}
                          className={`flex flex-col gap-1 ${message.isUser ? 'items-end' : 'items-start'}`}
                        >
                          <span
                            className={`flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase px-1 ${message.isUser ? '' : 'text-muted-foreground'}`}
                            style={message.isUser ? { color: theme.colors.primary } : undefined}
                          >
                            {message.isUser ? (
                              <>
                                <User className="h-3 w-3" /> Você
                              </>
                            ) : (
                              <>
                                <Bot className="h-3 w-3" /> Guia
                              </>
                            )}
                          </span>
                          <div
                            className={`${message.isUser ? 'w-fit max-w-[85%]' : 'w-fit max-w-[88%] min-w-[64px]'} px-3.5 py-2.5 rounded-2xl text-[13px] leading-6 shadow-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap ${message.isUser ? 'text-white rounded-br-md' : 'bg-card border rounded-bl-md'}`}
                            style={
                              message.isUser ? { backgroundColor: theme.colors.primary } : undefined
                            }
                          >
                            {message.isUser ? (
                              <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {message.text}
                              </span>
                            ) : isTyping ? (
                              <span className="inline-flex items-center justify-center gap-1.5 min-h-[20px] py-0.5">
                                <span
                                  className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]"
                                  style={{ backgroundColor: theme.colors.primary }}
                                />
                                <span
                                  className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]"
                                  style={{ backgroundColor: theme.colors.primary }}
                                />
                                <span
                                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                                  style={{ backgroundColor: theme.colors.primary }}
                                />
                              </span>
                            ) : (
                              <span className="block [&>strong]:font-semibold [&>strong]:text-foreground">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: renderSafeMarkdown(message.text),
                                  }}
                                />
                                {isStreaming && (
                                  <span
                                    className="inline-block w-[2px] h-[14px] animate-pulse ml-1 align-text-bottom"
                                    style={{ backgroundColor: theme.colors.primary }}
                                    aria-hidden
                                  />
                                )}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {formatTime(message.timestamp)}
                          </span>
                        </motion.div>
                      );
                    })}
                    <div ref={endRef} aria-hidden className="h-0" />
                  </div>

                  <div className="p-2.5 border-t bg-card shrink-0 flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Pergunte ou digite 'almoço 25'..."
                      disabled={isProcessing}
                      aria-label="Digite sua mensagem"
                      className="flex-1 h-9 rounded-full bg-muted/50"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isProcessing}
                      size="icon"
                      className="h-9 w-9 rounded-full shrink-0 text-white hover:opacity-90"
                      style={{ backgroundColor: theme.colors.primary }}
                      aria-label="Enviar"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="px-3 py-2 bg-card border-t">
                    <div className="flex flex-wrap gap-1.5">
                      {visibleShortcuts.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium cursor-pointer bg-card hover:text-white transition-colors"
                          style={{ borderColor: theme.colors.border } as any}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor =
                              theme.colors.primary;
                            (e.currentTarget as HTMLElement).style.borderColor =
                              theme.colors.primary;
                            (e.currentTarget as HTMLElement).style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '';
                            (e.currentTarget as HTMLElement).style.borderColor =
                              theme.colors.border;
                            (e.currentTarget as HTMLElement).style.color = '';
                          }}
                          onClick={() => handleExampleClick(s)}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
