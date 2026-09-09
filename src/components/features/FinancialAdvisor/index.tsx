/**
 * @file components/features/FinancialAdvisor/index.tsx
 * @description Chat com consultor financeiro IA (via backend proxy).
 * Analisa dados reais do usuário e responde sobre gastos e investimentos.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { buildFinancialContext, streamAdvisor } from '../../../services/financialAdvisorService';
import * as C from './styles';

declare const puter: any;

/** Mensagem do chat */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Renderiza markdown básico: **negrito**, listas e quebras de linha */
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\.\s+(.+)/gm, '<strong>$1.</strong> $2')
    .replace(/^-\s+(.+)/gm, '&bull; $1')
    .replace(/\n/g, '<br/>');
}

/** Sugestões iniciais clicáveis */
const SUGGESTIONS = [
  'Vale a pena comprar um carro novo?',
  'Devo investir em renda fixa ou ações?',
  'Como estão meus gastos este mês?',
  'Posso planejar uma viagem?',
  'Quanto posso gastar com lazer?',
];

/**
 * Componente de chat com consultor financeiro IA.
 * Recebe dados reais do usuário via TransactionsContext e usa backend proxy para streaming.
 */
const FinancialAdvisor: React.FC = () => {
  const { transactions, categories } = useTransactions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Auto-scroll para a última mensagem */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /** Envia mensagem e recebe resposta com streaming */
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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content } : m
            )
          );
        }
      } catch (error) {
        console.error('Erro no consultor financeiro:', error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: 'Erro ao conectar com o consultor. Tente novamente.' }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [isStreaming, messages, transactions, categories]
  );

  /** handleSubmit do formulário */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /** Handle de tecla Enter no input */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <C.Container>
      <C.Header>
        <C.HeaderIcon>🤖</C.HeaderIcon>
        <div>
          <C.Title>Consultor Financeiro</C.Title>
          <C.Subtitle>IA analisa seus dados reais</C.Subtitle>
        </div>
      </C.Header>

      <C.MessagesArea>
        {messages.length === 0 && (
          <C.Welcome>
            <C.WelcomeIcon>💡</C.WelcomeIcon>
            <C.WelcomeTitle>Olá! Sou seu consultor financeiro.</C.WelcomeTitle>
            <C.WelcomeText>
              Analiso seus dados reais para dar conselhos personalizados.
              Pergunte sobre gastos, investimentos ou planejamento.
            </C.WelcomeText>
            <C.Suggestions>
              {SUGGESTIONS.map((s, i) => (
                <C.SuggestionChip key={i} onClick={() => sendMessage(s)}>
                  {s}
                </C.SuggestionChip>
              ))}
            </C.Suggestions>
          </C.Welcome>
        )}

        {messages.map((msg) => (
          <C.Message key={msg.id} $isUser={msg.role === 'user'}>
            <C.MessageBubble
              $isUser={msg.role === 'user'}
              dangerouslySetInnerHTML={
                msg.role === 'assistant' && msg.content
                  ? { __html: renderMarkdown(msg.content) }
                  : undefined
              }
            >
              {msg.role === 'user' || !msg.content
                ? msg.content ||
                  (isStreaming && msg.role === 'assistant' ? '⏳ Pensando...' : '')
                : null}
            </C.MessageBubble>
            <C.MessageTime>
              {msg.timestamp.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </C.MessageTime>
          </C.Message>
        ))}
        <div ref={messagesEndRef} />
      </C.MessagesArea>

      <C.InputForm onSubmit={handleSubmit}>
        <C.MessageInput
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre suas finanças..."
          disabled={isStreaming}
        />
        <C.SendButton type="submit" disabled={!input.trim() || isStreaming}>
          {isStreaming ? '⏳' : '➤'}
        </C.SendButton>
      </C.InputForm>
    </C.Container>
  );
};

export default FinancialAdvisor;
