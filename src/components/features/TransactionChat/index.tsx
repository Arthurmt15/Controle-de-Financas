/**
 * @file components/features/TransactionChat/index.tsx
 * @description Componente de chat para adicionar transações por mensagem.
 * Permite ao usuário digitar mensagens como "Almoço R$ 25" e cria a transação.
 */

import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { useTransactions } from '../../../hooks/useTransactions';
import { parseTransactionFromMessage, getExampleMessages } from '../../../utils/parseTransaction';
import * as C from './styles';
import type { Transaction } from '../../../types';

/**
 * Interface para mensagens do chat
 */
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  transaction?: Transaction;
}

/**
 * Props do componente TransactionChat
 */
interface TransactionChatProps {
  /** Função chamada quando uma transação é criada (para opcionalmente preencher o formulário) */
  onTransactionCreated?: (transaction: Omit<Transaction, 'id'>) => void;
}

/**
 * Componente de chat para adicionar transações
 * @param {TransactionChatProps} props - Props do componente
 * @returns {JSX.Element} Componente TransactionChat renderizado
 *
 * @example
 * <TransactionChat />
 *
 * @example
 * <TransactionChat onTransactionCreated={(t) => console.log(t)} />
 */
const TransactionChat: React.FC<TransactionChatProps> = ({
  onTransactionCreated,
}) => {
  const { addTransaction, categories, isLoading } = useTransactions();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const examples = getExampleMessages();

  /**
   * Rola para a última mensagem
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Mensagem de boas-vindas
   */
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: 'Olá! Digite uma mensagem para adicionar uma transação. Ex: "Almoço R$ 35" ou "Entrada R$ 2000 salário"',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  /**
   * Gera ID único para mensagem
   */
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Adiciona mensagem ao chat
   */
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

  /**
   * Processa mensagem do usuário
   */
  const processMessage = async (text: string) => {
    setIsProcessing(true);

    // Adiciona mensagem do usuário
    addMessage(text, true);

    // Tenta parsear a mensagem
    const parsed = parseTransactionFromMessage(text);

    if (!parsed) {
      addMessage(
        'Não consegui identificar uma transação válida. Tente algo como "Almoço R$ 25" ou "Entrada R$ 500 salário".',
        false
      );
      setIsProcessing(false);
      return;
    }

    // Verifica se categorias estão carregadas
    if (isLoading) {
      addMessage(
        'Carregando categorias... aguarde um momento e tente novamente.',
        false
      );
      setIsProcessing(false);
      return;
    }

    // Verifica se existem categorias
    if (categories.length === 0) {
      addMessage(
        'Nenhuma categoria encontrada. Recarregue a página (F5) e tente novamente.',
        false
      );
      setIsProcessing(false);
      return;
    }

    // Encontra categoria apropriada
    const matchingCategory = categories.find(
      c => c.defaultType === parsed.type || c.defaultType === 'both'
    );
    const defaultCategoryId = matchingCategory?.id || categories[0]?.id || '';

    if (!defaultCategoryId) {
      addMessage(
        'Erro: nenhuma categoria válida encontrada. Recarregue a página (F5).',
        false
      );
      setIsProcessing(false);
      return;
    }

    // Cria a transação
    const transactionData: Omit<Transaction, 'id'> = {
      description: parsed.description,
      amount: parsed.amount,
      type: parsed.type,
      date: parsed.date || new Date().toISOString(),
      categoryId: defaultCategoryId,
    };

    try {
      await addTransaction(transactionData);

      // Mensagem de sucesso
      const typeLabel = parsed.type === 'income' ? 'Entrada' : 'Saída';
      addMessage(
        `Transação criada com sucesso! ✅\n${typeLabel}: ${parsed.description}\nValor: R$ ${parsed.amount.toFixed(2).replace('.', ',')}`,
        false
      );

      // Chama callback se fornecido
      if (onTransactionCreated) {
        onTransactionCreated(transactionData);
      }
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      const errorMsg = error?.message || 'Erro desconhecido';
      addMessage(
        `Erro ao criar a transação: ${errorMsg}`,
        false
      );
    }

    setIsProcessing(false);
  };

  /**
   * Envia mensagem
   */
  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;

    setInputValue('');
    processMessage(text);
  };

  /**
   * Trata Enter no input
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Usa exemplo clicado
   */
  const handleExampleClick = (example: string) => {
    setInputValue(example);
    inputRef.current?.focus();
  };

  /**
   * Trata upload de imagem
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addMessage('Por favor, selecione uma imagem válida.', false);
      return;
    }

    setIsProcessing(true);
    addMessage('🔍 Analisando comprovante...', false);

    try {
      const worker = await createWorker('por');
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const text = data.text.trim();
      if (!text) {
        addMessage('Não consegui ler texto na imagem. Por favor, digite os dados manualmente.\nEx: "Supermercado R$ 150,50"', false);
        setIsProcessing(false);
        return;
      }

      addMessage(`📝 Texto extraído:\n${text}`, false);

      // Tenta parsear a transação do texto extraído
      const parsed = parseTransactionFromMessage(text);
      if (parsed) {
        const matchingCategory = categories.find(
          c => c.defaultType === parsed.type || c.defaultType === 'both'
        );
        const defaultCategoryId = matchingCategory?.id || categories[0]?.id || '';

        if (defaultCategoryId) {
          const transactionData: Omit<Transaction, 'id'> = {
            description: parsed.description,
            amount: parsed.amount,
            type: parsed.type,
            date: parsed.date || new Date().toISOString(),
            categoryId: defaultCategoryId,
          };

          await addTransaction(transactionData);
          const typeLabel = parsed.type === 'income' ? 'Entrada' : 'Saída';
          addMessage(
            `✅ Transação criada!\n${typeLabel}: ${parsed.description}\nValor: R$ ${parsed.amount.toFixed(2).replace('.', ',')}`,
            false
          );
        }
      } else {
        addMessage('Não consegui identificar uma transação no texto. Por favor, digite manualmente.\nEx: "Almoço R$ 35"', false);
      }
    } catch (err) {
      console.error('Erro no OCR:', err);
      addMessage('Erro ao analisar a imagem. Por favor, digite os dados manualmente.', false);
    }

    setIsProcessing(false);
    e.target.value = '';
  };

  /**
   * Formata hora
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <C.ChatContainer>
      {/* Cabeçalho */}
      <C.ChatHeader>
        <C.ChatTitle>
          <C.TitleIcon>💬</C.TitleIcon>
          Chat Rápido
        </C.ChatTitle>
      </C.ChatHeader>

      {/* Área de mensagens */}
      <C.MessagesArea>
        {messages.map((message) => (
          <C.Message key={message.id} $isUser={message.isUser}>
            <C.MessageBubble $isUser={message.isUser}>
              {message.text}
            </C.MessageBubble>
            <C.MessageTime>{formatTime(message.timestamp)}</C.MessageTime>
          </C.Message>
        ))}
        <div ref={messagesEndRef} />
      </C.MessagesArea>

      {/* Input */}
      <C.InputContainer>
        <C.UploadButton
          as="label"
          htmlFor="chat-image-upload"
          title="Enviar foto de comprovante"
        >
          <C.UploadIcon>📷</C.UploadIcon>
        </C.UploadButton>
        <input
          type="file"
          id="chat-image-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <C.MessageInput
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ex: Almoço R$ 35"
          disabled={isProcessing}
        />

        <C.SendButton onClick={handleSend} disabled={!inputValue.trim() || isProcessing}>
          <C.SendIcon>➤</C.SendIcon>
        </C.SendButton>
      </C.InputContainer>

      {/* Dicas */}
      <C.TipsContainer>
        <C.TipsTitle>Exemplos (clique para usar):</C.TipsTitle>
        <C.ExamplesList>
          {examples.map((example, index) => (
            <C.ExampleChip
              key={index}
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </C.ExampleChip>
          ))}
        </C.ExamplesList>
      </C.TipsContainer>
    </C.ChatContainer>
  );
};

export default TransactionChat;
