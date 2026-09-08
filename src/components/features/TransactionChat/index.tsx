/**
 * @file components/features/TransactionChat/index.tsx
 * @description Componente de chat para adicionar transações por mensagem.
 * Permite ao usuário digitar mensagens como "Almoço R$ 25" e cria a transação.
 */

import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { useTransactions } from '../../../hooks/useTransactions';
import { parseTransactionFromMessage, getExampleMessages, CATEGORY_STYLES } from '../../../utils/parseTransaction';
import * as C from './styles';
import type { Transaction } from '../../../types';
import type { ParsedTransaction } from '../../../utils/parseTransaction';

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
<<<<<<< HEAD
  const { addTransaction, categories, isLoading, error } = useTransactions();
=======
  const { addTransaction, addCategory, categories, isLoading, error: txError } = useTransactions();
>>>>>>> 67d125b0dcd7cea617933e8829471436a6e68883
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    parsed: ParsedTransaction;
    suggestedCategory: string;
  } | null>(null);
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
        text: 'Olá! Digite uma mensagem para adicionar uma transação.\n\nExemplos:\n• "Gastei 120 da luz dia 5 de janeiro"\n• "Mercado ontem 150,50"\n• "Entrada 4k salário"',
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
        'Não consegui identificar uma transação válida. Tente algo como:\n• "Gastei 120 da luz dia 5 de janeiro"\n• "Mercado ontem 150,50"\n• "Entrada 4k salário"',
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

    // Verifica se houve erro ao carregar categorias
    if (error) {
      addMessage(
        `Erro ao carregar categorias: ${error}\nVerifique sua conexão e recarregue a página (F5).`,
        false
      );
      setIsProcessing(false);
      return;
    }

    // Verifica se existem categorias
    if (categories.length === 0) {
      const errorMsg = txError
        ? `Erro ao carregar categorias: ${txError}`
        : 'Nenhuma categoria encontrada.';
      addMessage(
<<<<<<< HEAD
        'Nenhuma categoria encontrada. Verifique se você está logado corretamente e recarregue a página (F5).',
=======
        `${errorMsg}\n\nPossíveis causas:\n• Conexão com o servidor falhou\n• Usuário ainda não foi criado no banco\n\nTente recarregar a página (F5).`,
>>>>>>> 67d125b0dcd7cea617933e8829471436a6e68883
        false
      );
      setIsProcessing(false);
      return;
    }

    // Encontra categoria pelo nome retornado pelo parser
    const matchCat = categories.find(
      c => c.name.toLowerCase() === parsed.categoria.toLowerCase()
    );

    // Se a categoria não existe, pergunta ao usuário
    if (!matchCat) {
      setPendingTransaction({ parsed, suggestedCategory: parsed.categoria });
      addMessage(
        `A categoria "${parsed.categoria}" não foi encontrada. O que deseja?`,
        false
      );
      setIsProcessing(false);
      return;
    }

    // Categoria encontrada — cria a transação
    await createTransaction(parsed, matchCat.id);
    setIsProcessing(false);
  };

  /**
   * Cria a transação com a categoria definida
   */
  const createTransaction = async (parsed: ParsedTransaction, categoryId: string) => {
    const transactionType = parsed.tipo === 'receita' ? 'income' : 'expense';

    const transactionData: Omit<Transaction, 'id'> = {
      description: parsed.descricao,
      amount: parsed.valor,
      type: transactionType,
      date: parsed.data,
      categoryId,
    };

    try {
      await addTransaction(transactionData);

      const typeLabel = parsed.tipo === 'receita' ? '📈 Entrada' : '📉 Saída';
      addMessage(
        `Transação criada com sucesso! ✅\n${typeLabel}: ${parsed.descricao}\n💰 R$ ${parsed.valor.toFixed(2).replace('.', ',')}\n📅 ${parsed.data}\n🏷️ ${parsed.categoria}`,
        false
      );

      if (onTransactionCreated) {
        onTransactionCreated(transactionData);
      }
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      const errorMsg = error?.message || 'Erro desconhecido';
      addMessage(`Erro ao criar a transação: ${errorMsg}`, false);
    }
  };

  /**
   * Usuário escolheu usar "Outros" para a categoria pendente
   */
  const handleUseOutros = async () => {
    if (!pendingTransaction) return;

    const outrosCat = categories.find(c => c.name.toLowerCase() === 'outros');
    if (!outrosCat) {
      addMessage('Erro: categoria "Outros" não encontrada.', false);
      setPendingTransaction(null);
      return;
    }

    const { parsed } = pendingTransaction;
    setPendingTransaction(null);
    addMessage(`Usando categoria "Outros"`, true);
    await createTransaction(parsed, outrosCat.id);
  };

  /**
   * Usuário escolheu criar a categoria sugerida
   */
  const handleCreateCategory = async () => {
    if (!pendingTransaction) return;

    const { parsed, suggestedCategory } = pendingTransaction;
    const styles = CATEGORY_STYLES[suggestedCategory] || { color: '#636E72', icon: 'FaEllipsisH' };
    const tipo = parsed.tipo === 'receita' ? 'income' : 'expense';

    setPendingTransaction(null);
    addMessage(`Criando categoria "${suggestedCategory}"...`, true);

    try {
      const newCategory = await addCategory({
        name: suggestedCategory,
        color: styles.color,
        icon: styles.icon,
        defaultType: tipo,
      });

      addMessage(`✅ Categoria "${suggestedCategory}" criada!`, false);
      await createTransaction(parsed, newCategory.id);
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      addMessage(`Erro ao criar categoria: ${error?.message || 'desconhecido'}.\nUsando "Outros" como alternativa.`, false);

      const outrosCat = categories.find(c => c.name.toLowerCase() === 'outros');
      if (outrosCat) {
        await createTransaction(parsed, outrosCat.id);
      }
    }
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
        const matchCat = categories.find(
          c => c.name.toLowerCase() === parsed.categoria.toLowerCase()
        );
        const defaultCategoryId = matchCat?.id || categories[0]?.id || '';

        if (defaultCategoryId) {
          const transactionType = parsed.tipo === 'receita' ? 'income' : 'expense';
          const transactionData: Omit<Transaction, 'id'> = {
            description: parsed.descricao,
            amount: parsed.valor,
            type: transactionType,
            date: parsed.data,
            categoryId: defaultCategoryId,
          };

          await addTransaction(transactionData);
          const typeLabel = parsed.tipo === 'receita' ? '📈 Entrada' : '📉 Saída';
          addMessage(
            `✅ Transação criada!\n${typeLabel}: ${parsed.descricao}\n💰 R$ ${parsed.valor.toFixed(2).replace('.', ',')}\n📅 ${parsed.data}\n🏷️ ${parsed.categoria}`,
            false
          );
        }
      } else {
        addMessage('Não consegui identificar uma transação no texto. Por favor, digite manualmente.\nEx: "Mercado 150,50"', false);
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

      {/* Botões de decisão quando categoria não existe */}
      {pendingTransaction && (
        <C.PendingCategoryActions>
          <C.PendingCategoryButtons>
            <C.UseOtherButton onClick={handleUseOutros}>
              Usar "Outros"
            </C.UseOtherButton>
            <C.CreateCategoryButton onClick={handleCreateCategory}>
              Criar "{pendingTransaction.suggestedCategory}"
            </C.CreateCategoryButton>
          </C.PendingCategoryButtons>
        </C.PendingCategoryActions>
      )}

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
          placeholder={pendingTransaction ? "Escolha uma opção acima" : "Ex: Mercado ontem 150,50"}
          disabled={isProcessing || !!pendingTransaction}
        />

        <C.SendButton
          onClick={handleSend}
          disabled={!inputValue.trim() || isProcessing || !!pendingTransaction}
        >
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
