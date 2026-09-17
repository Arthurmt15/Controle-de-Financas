/**
 * @file components/features/TransactionChat/index.tsx
 * @description Chat rápido redesenhado com shadcn + tailwind + framer-motion + lucide.
 * Card com mensagens, Input + Button, Badge e motion. Preserva lógica de chat,
 * comandos e integração com IA advisor.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Trash2, Lightbulb, Loader2 } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useInstallments } from '../../../contexts/InstallmentsContext';
import { useDebts } from '../../../contexts/DebtsContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { getExampleMessages, parseTransactionFromMessage } from '../../../utils/parseTransaction';
import { detectCommand, executeCommand } from '../../../utils/chatCommands';
import { generateSummary, generateAnalysis } from '../../../utils/analysisEngine';
import { buildFinancialContext, streamAdvisor } from '../../../services/financialAdvisorService';
import { CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import type { Transaction } from '../../../types';

/** Interface para mensagens do chat */
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  transaction?: Transaction;
}

/** Renderiza markdown básico para negrito, listas e quebras */
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\.\s+(.+)/gm, '<strong>$1.</strong> $2')
    .replace(/^-\s+(.+)/gm, '&bull; $1')
    .replace(/\n/g, '<br/>');
}

/**
 * Chat rápido com IA - design shadcn
 */
const TransactionChat: React.FC = () => {
  const { theme } = useTheme();
  // Dados do contexto
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

  // Estado do chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs para scroll e foco
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Exemplos de mensagens
  const examples = getExampleMessages();
  const STORAGE_KEY = 'financas_chat_messages';

  // Sugestões dinâmicas — aparecem após resposta da IA para manter conversa fluida
  const dynamicFollowUps = useMemo(() => {
    if (isProcessing) return [];
    const last = messages[messages.length - 1];
    if (!last || last.isUser) return [];
    const txt = last.text.toLowerCase();
    // Se a última resposta foi sobre dúvida/valor/plano, sugere ações contextuais
    if (/d[uú]vida|2000|quanto posso|plano|parcel|dívida|investir|gastos|saldo/.test(txt)) {
      return [
        'Quero registrar como despesa',
        'Quanto posso gastar este mês?',
        'Me dê um plano em 3 passos',
      ];
    }
    if (/transa[çc][aã]o registrada/.test(txt)) {
      return ['Ver meu saldo', 'Quanto gastei este mês?', 'Planejar próxima compra'];
    }
    return ['Explique melhor', 'Quanto posso gastar?', 'Criar transação disso'];
  }, [messages, isProcessing]);

  /** Rola apenas a área de mensagens para baixo (sem rolar a página) */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  /** Carrega mensagens do localStorage ou exibe boas-vindas */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(
            parsed.map((m: ChatMessage) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
          return;
        }
      }
    } catch {
      /* ignora erro de parsing */
    }

    // Mensagem de boas-vindas
    setMessages([
      {
        id: 'welcome',
        text:
          'Olá! Sou seu assistente financeiro com IA. \n\n' +
          ' Para adicionar transações:\n' +
          '• "Mercado ontem 150,50"\n' +
          '• "Recebi 4k de salário"\n\n' +
          ' Para contas recorrentes:\n' +
          '• "conta recorrente cartão nubank 1500 dia 10"\n' +
          '• "contas recorrentes" — listar todas\n' +
          '• "gerar contas" — criar transações do mês\n\n' +
          ' Para criar categorias:\n' +
          '• "criar categoria [nome]"\n\n' +
          ' Para ver análises:\n' +
          '• "Como estão meus gastos?"\n' +
          '• "Posso viajar este mês?"\n\n' +
          ' Pergunte qualquer coisa sobre suas finanças!',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  /** Salva mensagens no localStorage quando mudam */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  /** Gera ID único para mensagem */
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  /** Adiciona mensagem ao chat */
  const addMessage = (text: string, isUser: boolean, transaction?: Transaction): ChatMessage => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      text,
      isUser,
      timestamp: new Date(),
      transaction,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  /** Processa mensagem do usuário - comandos, transação ou IA (prioriza dúvida/pergunta) */
  const processMessage = async (text: string) => {
    setIsProcessing(true);
    addMessage(text, true);

    // 1. Comandos locais (criar categoria, resumo, análise, ajuda)
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

    // 1b. Se for dúvida/pergunta clara, não tenta parsear como transação (evita "duvida de 2000" virar compra)
    const lowerForDoubt = text.toLowerCase();
    const isDoubtLike = /d[uú]vida|\?|posso\b|vale a pena|como\b.*\?|quanto posso|me ajuda|me explica|estou com uma d/.test(lowerForDoubt) && !/\b(comprei|paguei|gastei|mercado|supermercado|recebi|parcelado)\b/.test(lowerForDoubt);
    if (isDoubtLike) {
      // vai direto para IA (pula parse de transação)
    } else {
    // 2. Tentar parsear como transação simples
    const parsed = parseTransactionFromMessage(text);
    if (parsed) {
      let matchCat = categories.find((c) => c.name.toLowerCase() === parsed.categoria.toLowerCase());
      if (!matchCat) {
        matchCat = categories.find((c) => c.name.toLowerCase() === 'outros') || categories[0];
      }
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
          } catch (installmentError) {
            console.error('Transação criada, mas falhou ao criar parcelado:', installmentError);
          }
        }
        // Se mencionar dívida/dividida no chat, cria também em Dívidas (mesma lógica de parcelados)
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
          } catch (debtError) {
            console.error('Transação criada, mas falhou ao criar dívida:', debtError);
          }
        }
        addMessage(
          ` Transação registrada!\n` +
            ` ${transactionData.description}\n` +
            ` R$ ${transactionData.amount.toFixed(2).replace('.', ',')}\n` +
            ` ${formatDateBR(transactionData.date)}\n` +
            ` ${matchCat.name}` +
            (installmentCount > 0
              ? `\n Total: R$ ${parsed.valor.toFixed(2).replace('.', ',')} (${installmentCount}x)\n Parcelado criado em "Parcelados" (${installmentCount}x de R$ ${perInstallment.toFixed(2).replace('.', ',')})`
              : '') +
            (isDivided ? `\n Dívida criada em "Dívidas" (${installmentCount > 1 ? `${installmentCount}x` : 'à vista'})` : ''),
          false
        );
        setIsProcessing(false);
        return;
      }
    }
    } // fecha else do isDoubtLike — dúvida vai direto para IA abaixo

    // 3. Tudo o resto vai para a IA advisor (streaming) — agora dinâmico, com contexto e follow-ups
    const aiMsg: ChatMessage = {
      id: generateMessageId(),
      text: '',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    try {
      const context = buildFinancialContext(transactions, categories);
      const history = messages.slice(-20).map((m) => ({
        role: m.isUser ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));
      let accumulated = '';
      const chunks = streamAdvisor(text, context, history);
      const updateAiMessage = (t: string) => {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: t } : m)));
      };
      for await (const chunk of chunks) {
        accumulated += chunk;
        updateAiMessage(accumulated);
      }
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: 'Erro ao conectar com a IA. Tente novamente.' } : m)));
    }
    setIsProcessing(false);
  };

  /** Envia mensagem */
  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;
    setInputValue('');
    processMessage(text);
  };

  /** Usa exemplo clicado */
  const handleExampleClick = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  /** Formata data no padrão brasileiro */
  const formatDateBR = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  /** Formata hora */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  /** Limpa todo o histórico do chat */
  const handleClearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[560px]">
      {/* Cabeçalho do chat - com CardHeader estilizado */}
      <CardHeader className="p-4 border-b" style={{ background: `linear-gradient(90deg, ${theme.colors.primary}0d, transparent)` }}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg text-white flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
              <Bot className="h-4 w-4" />
            </span>
            Chat Rápido
            <Badge variant="secondary" className="ml-1 gap-1 rounded-full text-[11px] px-2 py-0">
              <Sparkles className="h-3 w-3" />
              IA
            </Badge>
          </CardTitle>
          {messages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleClearChat} className="h-7 rounded-lg gap-1 text-xs text-muted-foreground" title="Limpar histórico">
              <Trash2 className="h-3.5 w-3.5" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Área de mensagens */}
      <div
        ref={scrollContainerRef}
        role="log"
        aria-live="polite"
        aria-label="Mensagens do chat"
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20"
      >
        {messages.map((message, idx) => {
          const isTyping = !message.isUser && isProcessing && !message.text;
          const isStreamingThis = !message.isUser && isProcessing && !!message.text && idx === messages.length - 1;
          return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02, duration: 0.25 }}
            className={`flex flex-col gap-1 ${message.isUser ? 'items-end' : 'items-start'}`}
          >
            {/* Badge de autor */}
            <span className={`flex items-center gap-1 text-[11px] font-medium ${message.isUser ? '' : 'text-muted-foreground'}`} style={message.isUser ? { color: theme.colors.primary } : undefined}>
              {message.isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              {message.isUser ? 'Você' : 'Assistente'}
            </span>
            {/* Balão — w-fit evita compressão, sem flex */}
            <div
              className={`${message.isUser ? 'w-fit max-w-[85%]' : 'w-fit max-w-[88%] min-w-[64px]'} rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-6 shadow-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap ${
                message.isUser
                  ? 'text-white rounded-br-md'
                  : 'bg-background border text-foreground rounded-bl-md'
              }`}
              style={message.isUser ? { backgroundColor: theme.colors.primary } : undefined}
            >
              {message.isUser ? (
                <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.text}</span>
              ) : isTyping ? (
                <span className="inline-flex items-center justify-center gap-1.5 min-h-[20px] py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: theme.colors.primary }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: theme.colors.primary }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.colors.primary }} />
                </span>
              ) : (
                <span className="block [&>strong]:font-semibold">
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                  {isStreamingThis && <span className="inline-block w-[2px] h-[14px] animate-pulse ml-1 align-text-bottom" style={{ backgroundColor: theme.colors.primary }} aria-hidden />}
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground px-1">{formatTime(message.timestamp)}</span>
          </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem */}
      <div className="p-3 border-t bg-background flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Digite &quot;almoço 25&quot; ou pergunte à IA..."
          disabled={isProcessing}
          aria-label="Digite sua mensagem"
          className="flex-1 h-9 rounded-xl"
        />

        <Button onClick={handleSend} disabled={!inputValue.trim() || isProcessing} size="icon" className="h-9 w-9 rounded-xl shrink-0 text-white hover:opacity-90" style={{ backgroundColor: theme.colors.primary }} aria-label="Enviar mensagem">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Sugestões dinâmicas — aparecem após resposta da IA para manter conversa fluida */}
      {dynamicFollowUps.length > 0 && (
        <div className="px-3 py-2.5 border-t" style={{ backgroundColor: `${theme.colors.primary}0a`, borderColor: `${theme.colors.primary}14` }}>
          <p className="text-[11px] font-semibold tracking-widest uppercase mb-1.5 flex items-center gap-1" style={{ color: theme.colors.primary }}>
            <Sparkles className="h-3 w-3" /> Continue a conversa
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dynamicFollowUps.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer bg-card hover:text-white transition-colors"
                style={{ borderColor: `${theme.colors.primary}30` } as any}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = theme.colors.primary; (e.currentTarget as HTMLElement).style.borderColor = theme.colors.primary; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.borderColor = `${theme.colors.primary}30`; (e.currentTarget as HTMLElement).style.color = ''; }}
                onClick={() => handleExampleClick(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Dicas / exemplos - chips */}
      <div className="px-3 pb-3 bg-background">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
          <Lightbulb className="h-3 w-3" />
          Exemplos (clique para usar)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((example, index) => (
            <Badge
              key={index}
              variant="outline"
              className="rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors"
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionChat;
