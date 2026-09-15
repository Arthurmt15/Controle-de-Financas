/**
 * @file components/features/FinancialAdvisor/index.tsx
 * @description Chat com consultor financeiro IA redesenhado com shadcn + tailwind + framer-motion + lucide.
 * Card com header, área de mensagens scrollável, welcome com suggestions (Badge/Button), bubbles
 * estilizadas, Input shadcn e Button com ícone Send. Preserva streaming via financialAdvisorService.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, SendHorizontal, Loader2, User } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
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

function renderMarkdown(text: string): string {
  return text
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
    <Card className="rounded-2xl overflow-hidden flex flex-col h-[700px] lg:h-[700px] max-lg:h-[500px] max-sm:h-[450px] shadow-sm">
      {/* Header do chat */}
      <CardHeader className="py-3.5 px-4 flex flex-row items-center justify-center gap-2.5 border-b bg-card shrink-0 space-y-0">
        <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-500 text-white shrink-0">
          <Bot className="h-4 w-4" />
        </span>
        <div className="text-center">
          <h3 className="text-[14px] font-semibold leading-none flex items-center gap-1 justify-center">
            Consultor Financeiro <Sparkles className="h-3 w-3 text-violet-500" />
          </h3>
          <p className="text-xs text-muted-foreground mt-1">IA analisa seus dados reais</p>
        </div>
      </CardHeader>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-muted/20 min-h-0">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-6 gap-3 flex-1"
          >
            <span className="w-12 h-12 flex items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-200 text-violet-600 dark:border-transparent">
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
                  className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300 transition-colors"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
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
              {/* Bubble */}
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border shadow-sm rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && msg.content ? (
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  <span className="whitespace-pre-wrap">
                    {msg.content || (isStreaming && msg.role === 'assistant' ? 'Pensando...' : '')}
                  </span>
                )}
                {isStreaming && msg.role === 'assistant' && !msg.content && (
                  <span className="inline-flex items-center gap-1 ml-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground px-1">
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
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
              className="rounded-full h-10 bg-muted/50 border-muted-foreground/10 focus-visible:ring-violet-500"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="rounded-full w-10 h-10 shrink-0"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialAdvisor;
