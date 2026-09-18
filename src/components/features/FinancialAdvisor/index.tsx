/**
 * @file components/features/FinancialAdvisor/index.tsx
 * @description Chat com consultor financeiro IA redesenhado com shadcn + tailwind + framer-motion + lucide.
 * Card com header, área de mensagens scrollável, welcome com suggestions (Badge/Button), bubbles
 * estilizadas, Input shadcn e Button com ícone Send. Preserva streaming via financialAdvisorService.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, SendHorizontal, Loader2, User } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useTheme } from '../../../contexts/ThemeContext';
import { buildFinancialContext, streamAdvisor } from '../../../services/financialAdvisorService';
import { Card, CardHeader, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\.\s+(.+)/gm, '<strong>$1.</strong> $2')
    .replace(/^-\s+(.+)/gm, '&bull; $1')
    .replace(/\n/g, '<br/>');
}

const SUGGESTIONS = [
  'Vale a pena comprar um carro novo?',
  'Devo investir em renda fixa ou ações?',
  'Como estão meus gastos este mês?',
  'Posso planejar uma viagem?',
  'Quanto posso gastar com lazer?',
];

const FinancialAdvisor: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll dinâmico — mantém chat sempre no fim (como TransactionChat)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // scroll suave apenas durante streaming, instantâneo ao trocar mensagem
    el.scrollTo({ top: el.scrollHeight, behavior: isStreaming ? 'smooth' : 'auto' });
  }, [messages, isStreaming]);

  // Durante streaming, garante que acompanhe cada chunk (endRef)
  useEffect(() => {
    if (isStreaming) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsStreaming(true);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const context = buildFinancialContext(transactions, categories);
        const history = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        let accumulated = '';
        const chunks = streamAdvisor(text, context, history);
        for await (const chunk of chunks) {
          accumulated += chunk;
          const content = accumulated;
          setMessages((prev) => prev.map((m) => (m.id === assistantMsg.id ? { ...m, content } : m)));
        }
      } catch (error) {
        console.error('Erro no consultor financeiro:', error);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: 'Erro ao conectar com o consultor. Tente novamente.' } : m))
        );
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [isStreaming, messages, transactions, categories]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Card className="rounded-2xl overflow-hidden flex flex-col h-[520px] sm:h-[560px] lg:h-[620px] max-h-[70vh] lg:max-h-[72vh] shadow-sm">
      {/* Header do chat */}
      <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-center gap-2.5 border-b bg-card shrink-0 space-y-0">
        <span className="w-8 h-8 flex items-center justify-center rounded-xl text-white shrink-0" style={{ backgroundColor: theme.colors.primary }}>
          <Bot className="h-4 w-4" />
        </span>
        <div className="text-center">
          <h3 className="text-[14px] font-semibold leading-none flex items-center gap-1 justify-center">
            Consultor Financeiro <Sparkles className="h-3 w-3" style={{ color: theme.colors.primary }} />
          </h3>
          <p className="text-xs text-muted-foreground mt-1">IA analisa seus dados reais</p>
        </div>
      </CardHeader>

      {/* Área de mensagens — scroll interno dinâmico (não expande a página) */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Mensagens do consultor"
        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 bg-muted/20 scroll-smooth"
        style={{ scrollbarGutter: 'stable' as any }}
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-6 gap-3 flex-1"
          >
            <span className="w-12 h-12 flex items-center justify-center rounded-2xl border dark:border-transparent" style={{ backgroundColor: `${theme.colors.primary}14`, borderColor: `${theme.colors.primary}30`, color: theme.colors.primary }}>
              <Bot className="h-6 w-6" />
            </span>
            <h4 className="text-[15px] font-semibold">Olá! Sou seu consultor financeiro.</h4>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
              Analiso seus dados reais para dar conselhos personalizados. Pergunte sobre gastos, investimentos ou planejamento.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-w-[300px]">
              {SUGGESTIONS.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors"
                  style={{ backgroundColor: `${theme.colors.primary}0d`, borderColor: `${theme.colors.primary}30`, color: theme.colors.primary }}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isTyping = msg.role === 'assistant' && isStreaming && !msg.content;
            const isStreamingThis = msg.role === 'assistant' && isStreaming && !!msg.content && idx === messages.length - 1;
            return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Label do autor */}
              <span className="flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground px-1">
                {msg.role === 'user' ? (
                  <>
                    <User className="h-3 w-3" /> Você
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3" /> Consultor
                  </>
                )}
              </span>
              {/* Bubble — w-fit evita compressão, sem flex no container */}
              <div
                className={`${msg.role === 'user' ? 'w-fit max-w-[85%]' : 'w-fit max-w-[88%] min-w-[64px]'} px-3.5 py-2.5 rounded-2xl text-[13px] leading-6 shadow-sm break-words [overflow-wrap:anywhere] whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-md'
                    : 'bg-card border shadow-sm rounded-bl-md'
                }`}
                style={msg.role === 'user' ? { backgroundColor: theme.colors.primary } : undefined}
              >
                {msg.role === 'user' ? (
                  <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{msg.content}</span>
                ) : isTyping ? (
                  <span className="inline-flex items-center justify-center gap-1.5 min-h-[20px] py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: theme.colors.primary }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: theme.colors.primary }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.colors.primary }} />
                  </span>
                ) : (
                  <span className="block [&>strong]:font-semibold [&>strong]:text-foreground">
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    {isStreamingThis && <span className="inline-block w-[2px] h-[14px] animate-pulse ml-1 align-text-bottom" style={{ backgroundColor: theme.colors.primary }} aria-hidden />}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground px-1">
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
            );
          })}
        </AnimatePresence>
        {/* âncora para auto-scroll */}
        <div ref={endRef} aria-hidden className="h-0" />
      </div>

      {/* Input + botão */}
      <CardContent className="p-3 border-t bg-card shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre suas finanças..."
              disabled={isStreaming}
              className="rounded-full h-10 bg-muted/50 border-muted-foreground/10"
              style={{ ['--tw-ring-color' as any]: theme.colors.primary }}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="rounded-full w-10 h-10 shrink-0 text-white hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialAdvisor;
