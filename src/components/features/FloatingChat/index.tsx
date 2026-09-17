/**
 * @file components/features/FloatingChat/index.tsx
 * @description Chat flutuante único (guia do site) que unifica Chat Rápido + Consultor Financeiro.
 * Fica fixo no canto inferior direito em todas as páginas autenticadas.
 * Reutiliza pipeline completo de TransactionChat (comandos, transações, parcelados, dívidas, IA)
 * + welcome/sugestões do FinancialAdvisor, com scroll interno dinâmico.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Send, X, Loader2, User } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useInstallments } from '../../../contexts/InstallmentsContext';
import { useDebts } from '../../../contexts/DebtsContext';
import { parseTransactionFromMessage } from '../../../utils/parseTransaction';
import { detectCommand, executeCommand } from '../../../utils/chatCommands';
import { generateSummary, generateAnalysis } from '../../../utils/analysisEngine';
import { buildFinancialContext, streamAdvisor } from '../../../services/financialAdvisorService';
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

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\.\s+(.+)/gm, '<strong>$1.</strong> $2')
    .replace(/^-\s+(.+)/gm, '&bull; $1')
    .replace(/\n/g, '<br/>');
}

const SUGGESTIONS_GUIDE = [
  'Como lançar despesa?',
  'Ver parcelados e dívidas',
  'Meu saldo este mês',
];

const FloatingChat: React.FC = () => {
  const location = useLocation();
  const {
    transactions,
    addTransaction,
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

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = 'financas_floating_chat';
  const LEGACY_KEY = 'financas_chat_messages';

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

  // Carrega histórico (migra legado) ou welcome
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) })));
          // migra para nova chave
          if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, saved);
          return;
        }
      }
    } catch {}
    setMessages([
      {
        id: 'welcome',
        text:
          'Olá! Sou seu **Guia Inteligente** — faço tudo que os chats faziam, num só lugar. \n\n' +
          '**Posso te guiar no site:**\n' +
          '• Dashboard, Transações, Parcelados & Dívidas, Reserva, Análise, Gastos Futuros\n' +
          '• Como lançar: `"Mercado ontem 150,50"` ou `"Recebi 4k de salário"`\n' +
          '• Parcelado: `"Compra 1000 reais 10x"` → vai para Parcelados\n' +
          '• Dívida dividida: `"jantar 200 dividido"` ou `"divida 500 em 5x"`\n' +
          '• Reserva: vá em **Reserva** para definir meta (6x despesas) e depositar\n' +
          '• Recorrente: `"conta recorrente cartão 1500 dia 10"`\n\n' +
          '**E sou seu Consultor IA:** pergunte `"Como estão meus gastos?"` ou `"Posso viajar este mês?"`\n\n' +
          'Me pergunte qualquer coisa — respondo com seus dados reais!',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

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
    const m: ChatMessage = { id: generateMessageId(), text, isUser, timestamp: new Date(), transaction };
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
        recurringBills
      );
      addMessage(response, false);
      setIsProcessing(false);
      return;
    }

    // 1b. Guia do site — perguntas sobre navegação vão para IA com contexto do site
    const lowerGuide = text.toLowerCase();
    const isGuideQuestion = /\b(onde|como|o que|quais|me mostre|me leva|guia|tutorial|usar|funciona).*\b(dashboard|transa[çc]|parcelad|d[ií]vida|gastos futuros|an[aá]lise|configura|categoria|consultor)/i.test(lowerGuide)
      || /\b(o que posso fazer|como navego|me ajuda a usar)\b/i.test(lowerGuide);
    // isGuideQuestion também vai para IA, mas com contexto extra abaixo

    // 1c. Dúvida/pergunta clara → não tenta parsear como transação (inclui planejamento de investimento)
    const lowerForDoubt = text.toLowerCase();
    const isPlanningDoubt = /\b(pretendo|planejo|quero)\s+(investir|aplicar|guardar)\b/i.test(lowerForDoubt) || /\bquanto.*ganho\b/i.test(lowerForDoubt) || /\blucro\b.*%.*ao ano\b/i.test(lowerForDoubt);
    const isDoubtLike = isPlanningDoubt || (/d[uú]vida|\?|posso\b|vale a pena|como\b.*\?|quanto posso|quanto ganho|me ajuda|me explica|estou com uma d|pretendo/.test(lowerForDoubt) && !/\b(comprei|paguei|gastei|mercado|supermercado|recebi|parcelado|investi|apliquei)\b/.test(lowerForDoubt));
    if (isDoubtLike && !isGuideQuestion) {
      // vai direto para IA
    } else if (!isGuideQuestion || /\b(R\$|reais|mercado|comprei|paguei|gastei|recebi)\b/i.test(lowerGuide)) {
      // 2. Tentar parsear como transação (se não for só pergunta de guia)
      const parsed = parseTransactionFromMessage(text);
      if (parsed) {
        let matchCat = categories.find((c) => c.name.toLowerCase() === parsed.categoria.toLowerCase());
        if (!matchCat) matchCat = categories.find((c) => c.name.toLowerCase() === 'outros') || categories[0];
        if (matchCat) {
          const installmentCount = parsed.parcelas || 0;
          const isDivided = /\b(dividid[ao]|d[ií]vida|racha|compartilhad[ao])\b/i.test(text);
          const perInstallment = installmentCount > 0 ? parsed.valor / installmentCount : parsed.valor;
          const installmentLabel = installmentCount > 0 ? `1/${installmentCount}` : '';
          const descriptionWithInstallment = installmentLabel ? `${parsed.descricao} ${installmentLabel}` : parsed.descricao;
          const transactionData: Omit<Transaction, 'id'> = {
            description: descriptionWithInstallment + (isDivided ? ' [Dividida]' : ''),
            amount: perInstallment,
            type: parsed.tipo === 'despesa' ? 'expense' : 'income',
            date: new Date(parsed.data + 'T12:00:00').toISOString(),
            categoryId: matchCat.id,
            notes: installmentCount > 0 ? `Parcelado em ${installmentCount}x - Total R$ ${parsed.valor.toFixed(2).replace('.', ',')}` : '',
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
                notes: `Criado via chat (dívida dividida) - Total R$ ${parsed.valor.toFixed(2).replace('.', ',')} ${parcels > 1 ? `em ${parcels}x` : 'à vista'}`,
                source: 'manual',
              });
            } catch {}
          }
          const successMsg = ` Transação registrada!\n ${transactionData.description}\n R$ ${transactionData.amount.toFixed(2).replace('.', ',')}\n ${new Date(transactionData.date).toLocaleDateString('pt-BR')}\n ${matchCat.name}` + (installmentCount > 0 ? `\n Total: R$ ${parsed.valor.toFixed(2).replace('.', ',')} (${installmentCount}x)` : '') + (isDivided ? `\n Dívida criada em Dívidas` : '');
          addMessage(successMsg, false);
          setIsProcessing(false);
          return;
        }
      }
    }

    // 3. IA — Consultor + Guia (streaming)
    const aiMsg: ChatMessage = { id: generateMessageId(), text: '', isUser: false, timestamp: new Date() };
    setMessages((prev) => [...prev, aiMsg]);
    try {
      const financialContext = buildFinancialContext(transactions, categories);
      const siteGuide = `
GUIA DO SITE:
- Dashboard: visão geral, saldo, gráficos e atalho para Reserva
- Transações: lançar por chat ("almoço 25") ou formulário; parcelado/divida via chat ou formulário unificado
- Parcelados & Dívidas (/installments): lista unificada, métricas, próximo pagamento, avançar parcela; dívidas também aparecem aqui quando transação marcada como dividida
- Reserva de Emergência (/emergency-reserve): defina meta (sugestão 6x despesas), deposite/saque e acompanhe progresso
- Análise (/analysis): evolução mensal, insights, consultor
- Gastos Futuros: planejar despesas futuras
- Configurações: categorias, orçamentos
Responda como guia quando pergunta for sobre navegação.`;
      const context = financialContext + '\n' + siteGuide;
      const history = messages.slice(-20).map((m) => ({ role: m.isUser ? ('user' as const) : ('assistant' as const), content: m.text }));
      let accumulated = '';
      const chunks = streamAdvisor(text, context, history);
      const updateAiMessage = (t: string) => setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: t } : m)));
      for await (const chunk of chunks) {
        accumulated += chunk;
        updateAiMessage(accumulated);
      }
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: 'Erro ao conectar com a IA. Tente novamente.' } : m)));
    }
    setIsProcessing(false);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;
    setInputValue('');
    processMessage(text);
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isLogin) return null;

  return (
    <>
      {/* FAB */}
      <motion.button
        ref={fabRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Fechar guia' : 'Abrir guia inteligente'}
        title={isOpen ? 'Fechar' : 'Guia Inteligente — pergunte qualquer coisa'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="h-6 w-6" /></motion.div> : <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative"><Bot className="h-6 w-6" /><span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" /></motion.div>}
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
              <CardHeader className="p-3.5 border-b bg-gradient-to-r from-violet-600 to-indigo-600 text-white shrink-0 flex flex-row items-center justify-between gap-2 space-y-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center"><Bot className="h-4 w-4" /></span>
                  <div>
                    <CardTitle className="text-[14px] font-semibold text-white leading-none flex items-center gap-1.5">Guia Inteligente <Sparkles className="h-3 w-3 text-white/80" /></CardTitle>
                    <p className="text-[11px] text-white/80 leading-none mt-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online • faz tudo</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="h-3.5 w-3.5" /></Button>
                </div>
              </CardHeader>

              <div ref={scrollRef} role="log" aria-live="polite" aria-label="Mensagens do guia" className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-3 bg-muted/20 scroll-smooth">
                {messages.map((message, idx) => {
                  const isTyping = !message.isUser && isProcessing && !message.text;
                  const isStreaming = !message.isUser && isProcessing && !!message.text && idx === messages.length - 1;
                  return (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.01 }} className={`flex flex-col gap-1 ${message.isUser ? 'items-end' : 'items-start'}`}>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase px-1 ${message.isUser ? 'text-primary' : 'text-muted-foreground'}`}>
                      {message.isUser ? <><User className="h-3 w-3" /> Você</> : <><Bot className="h-3 w-3" /> Guia</>}
                    </span>
                    <div className={`${message.isUser ? 'w-fit max-w-[85%]' : 'w-fit max-w-[88%] min-w-[64px]'} px-3.5 py-2.5 rounded-2xl text-[13px] leading-6 shadow-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap ${message.isUser ? 'bg-violet-600 text-white rounded-br-md' : 'bg-card border rounded-bl-md'}`}>
                      {message.isUser ? (
                        <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.text}</span>
                      ) : isTyping ? (
                        <span className="inline-flex items-center justify-center gap-1.5 min-h-[20px] py-0.5">
                          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
                        </span>
                      ) : (
                        <span className="block [&>strong]:font-semibold [&>strong]:text-foreground">
                          <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                          {isStreaming && <span className="inline-block w-[2px] h-[14px] bg-violet-500 animate-pulse ml-1 align-text-bottom" aria-hidden />}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">{formatTime(message.timestamp)}</span>
                  </motion.div>
                  );
                })}
                <div ref={endRef} aria-hidden className="h-0" />
              </div>

              {/* Input */}
              <div className="p-2.5 border-t bg-card shrink-0 flex items-center gap-2">
                <Input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Pergunte ou digite 'almoço 25'..." disabled={isProcessing} aria-label="Digite sua mensagem" className="flex-1 h-9 rounded-full bg-muted/50" />
                <Button onClick={handleSend} disabled={!inputValue.trim() || isProcessing} size="icon" className="h-9 w-9 rounded-full shrink-0 bg-violet-600 hover:bg-violet-700" aria-label="Enviar"><Send className="h-4 w-4" /></Button>
              </div>

              {/* Atalhos resumidos — 2 a 3 chips apenas */}
              <div className="px-3 py-2 bg-card border-t">
                <div className="flex flex-wrap gap-1.5">
                  {visibleShortcuts.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium cursor-pointer bg-card hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors"
                      onClick={() => handleExampleClick(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
