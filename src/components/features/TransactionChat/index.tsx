/**
 * @file components/features/TransactionChat/index.tsx
 * @description Componente de chat para adicionar transações por mensagem.
 * Permite ao usuário digitar mensagens como "Almoço R$ 25" e cria a transação.
 * Suporta comandos como "criar categoria", "resumo", "análise" e "ajuda".
 * Suporta upload de comprovantes via OCR com processamento inteligente.
 */

import React, { useState, useRef, useEffect } from 'react';
import { extractTextFromImage } from '../../../services/ocrService';
import { useTransactions } from '../../../hooks/useTransactions';
import { getExampleMessages } from '../../../utils/parseTransaction';
import { detectCommand, executeCommand } from '../../../utils/chatCommands';
import { generateSummary, generateAnalysis } from '../../../utils/analysisEngine';
import { parseReceiptText, getReceiptResponse } from '../../../utils/receiptParser';
import { buildFinancialContext, streamAdvisor } from '../../../services/financialAdvisorService';
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

/** Renderiza markdown básico */
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+)\.\s+(.+)/gm, '<strong>$1.</strong> $2')
    .replace(/^-\s+(.+)/gm, '&bull; $1')
    .replace(/\n/g, '<br/>');
}

/**
 * Componente de chat rápido com IA
 */
const TransactionChat: React.FC = () => {
  const { transactions, addTransaction, addCategory, deleteCategory, categories } = useTransactions();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingReceiptType, setPendingReceiptType] = useState<{
    description: string;
    amount: string;
    date: string;
    categoryId: string;
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
        text: 'Olá! Sou seu assistente financeiro com IA. 💬\n\n' +
          '📝 Para adicionar transações:\n' +
          '• "Mercado ontem 150,50"\n' +
          '• "Recebi 4k de salário"\n\n' +
          '📊 Para ver análises:\n' +
          '• "Como estão meus gastos?"\n' +
          '• "Posso viajar este mês?"\n\n' +
          '📂 Para criar categorias:\n' +
          '• "criar categoria [nome]"\n\n' +
          '❓ Pergunte qualquer coisa sobre suas finanças!',
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
   * Comandos e OCR vão direto. Todo o resto vai para a IA.
   */
  const processMessage = async (text: string) => {
    setIsProcessing(true);

    // Adiciona mensagem do usuário
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
      );
      addMessage(response, false);
      setIsProcessing(false);
      return;
    }

    // 2. Texto colado de comprovante (2+ linhas)
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 2) {
      const receipt = parseReceiptText(text);
      if (receipt.amount) {
        const searchTerms = [receipt.description, receipt.store].filter(Boolean).join(' ').toLowerCase();
        let matchCat = categories.find(c => {
          const catName = c.name.toLowerCase();
          return searchTerms.includes(catName) ||
            catName.includes(searchTerms.split(' ')[0]);
        });

        if (!matchCat) {
          matchCat = categories.find(c => c.name.toLowerCase() === 'outros') || categories[0];
        }

        if (matchCat) {
          const responseMsg = getReceiptResponse(receipt);
          addMessage(responseMsg, false);

          const transactionData: Omit<Transaction, 'id'> = {
            description: receipt.description || receipt.store || 'Compra',
            amount: receipt.amount,
            type: 'expense',
            date: receipt.date ? new Date(receipt.date + 'T12:00:00').toISOString() : new Date().toISOString(),
            categoryId: matchCat.id,
            notes: '',
          };

          await addTransaction(transactionData);
          addMessage(
            `✅ Transação criada!\n` +
            `📝 ${transactionData.description}\n` +
            `💰 R$ ${transactionData.amount.toFixed(2).replace('.', ',')}\n` +
            `📅 ${formatDateBR(transactionData.date)}\n` +
            `🏷️ ${matchCat.name}`,
            false
          );
        } else {
          addMessage(
            `📝 Texto reconhecido mas sem categoria.\n` +
            `Crie uma com "criar categoria [nome]"`,
            false
          );
        }
        setIsProcessing(false);
        return;
      }
    }

    // 3. Tudo o resto vai para a IA
    const aiMsg: ChatMessage = {
      id: generateMessageId(),
      text: '',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);

    try {
      const context = buildFinancialContext(transactions, categories);
      const history = messages.slice(-6).map((m) => ({
        role: m.isUser ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      let accumulated = '';
      const chunks = streamAdvisor(text, context, history);
      for await (const chunk of chunks) {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, text: accumulated } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsg.id
            ? { ...m, text: 'Erro ao conectar com a IA. Tente novamente.' }
            : m
        )
      );
    }

    setIsProcessing(false);
  };

  /**
   * Usuário escolheu "Entrada" para o comprovante
   */
  const handleReceiptIncome = async () => {
    if (!pendingReceiptType) return;

    const { description, amount, date, categoryId } = pendingReceiptType;
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addMessage('❌ Valor inválido. Verifique o valor digitado.', false);
      return;
    }

    setPendingReceiptType(null);

    const transactionData: Omit<Transaction, 'id'> = {
      description,
      amount: parsedAmount,
      type: 'income',
      date: date ? new Date(date + 'T12:00:00').toISOString() : new Date().toISOString(),
      categoryId,
      notes: '',
    };

    try {
      await addTransaction(transactionData);
      addMessage(
        `✅ Transação criada!\n` +
        `📈 Entrada: ${description}\n` +
        `💰 R$ ${parsedAmount.toFixed(2).replace('.', ',')}\n` +
        `📅 ${formatDateBR(transactionData.date)}\n` +
        `🏷️ ${categories.find(c => c.id === categoryId)?.name || ''}`,
        false
      );
    } catch (error: any) {
      addMessage(`Erro ao criar transação: ${error?.message || 'desconhecido'}`, false);
    }
  };

  /**
   * Usuário escolheu "Saída" para o comprovante
   */
  const handleReceiptExpense = async () => {
    if (!pendingReceiptType) return;

    const { description, amount, date, categoryId } = pendingReceiptType;
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addMessage('❌ Valor inválido. Verifique o valor digitado.', false);
      return;
    }

    setPendingReceiptType(null);

    const transactionData: Omit<Transaction, 'id'> = {
      description,
      amount: parsedAmount,
      type: 'expense',
      date: date ? new Date(date + 'T12:00:00').toISOString() : new Date().toISOString(),
      categoryId,
      notes: '',
    };

    try {
      await addTransaction(transactionData);
      addMessage(
        `✅ Transação criada!\n` +
        `📉 Saída: ${description}\n` +
        `💰 R$ ${parsedAmount.toFixed(2).replace('.', ',')}\n` +
        `📅 ${formatDateBR(transactionData.date)}\n` +
        `🏷️ ${categories.find(c => c.id === categoryId)?.name || ''}`,
        false
      );
    } catch (error: any) {
      addMessage(`Erro ao criar transação: ${error?.message || 'desconhecido'}`, false);
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
   * Trata upload de imagem (comprovante/nota fiscal)
   * Usa processador inteligente para extrair valor, data, loja e método de pagamento
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
      const ocrResult = await extractTextFromImage(file, 'por');
      const text = ocrResult.text;

      if (!text) {
        addMessage('Não consegui ler texto na imagem. Por favor, digite os dados manualmente.\nEx: "Mercado 150,50"', false);
        setIsProcessing(false);
        return;
      }

      // Processa o texto do OCR com o parser inteligente de comprovantes
      const receipt = parseReceiptText(text);

      // Se não conseguiu extrair valor, manda para a IA interpretar
      if (!receipt.amount) {
        const aiMsg: ChatMessage = {
          id: generateMessageId(),
          text: '',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        try {
          const context = buildFinancialContext(transactions, categories);
          const prompt = `Texto de comprovante/nota fiscal extraído por OCR:\n\n${text}\n\nInterprete este texto e me diga: valor, data, descrição e categoria sugerida. Se for uma transação, crie ela.`;
          let accumulated = '';
          const chunks = streamAdvisor(prompt, context, []);
          for await (const chunk of chunks) {
            accumulated += chunk;
            setMessages((prev) =>
              prev.map((m) => (m.id === aiMsg.id ? { ...m, text: accumulated } : m))
            );
          }
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsg.id
                ? { ...m, text: '❌ Não consegui interpretar o comprovante. Por favor, digite manualmente.\nEx: "Mercado 150,50"' }
                : m
            )
          );
        }
        setIsProcessing(false);
        e.target.value = '';
        return;
      }

      // Valor extraído com sucesso - encontra categoria e mostra formulário editável
      const searchTerms = [receipt.description, receipt.store].filter(Boolean).join(' ').toLowerCase();
      let matchCat = categories.find(c => {
        const catName = c.name.toLowerCase();
        return searchTerms.includes(catName) ||
          catName.includes(searchTerms.split(' ')[0]);
      });

      // Se não encontrou, usa "Outros"
      if (!matchCat) {
        matchCat = categories.find(c => c.name.toLowerCase() === 'outros') || categories[0];
      }

      if (matchCat) {
        const description = receipt.description || receipt.store || 'Comprovante';
        const receiptDate = receipt.date || '';
        const amountStr = receipt.amount.toFixed(2).replace('.', ',');

        setPendingReceiptType({
          description,
          amount: amountStr,
          date: receiptDate,
          categoryId: matchCat.id,
        });

        addMessage(
          `✅ Dados identificados (edite antes de confirmar):\n\n` +
          `💰 Valor: R$ ${amountStr}\n` +
          `📅 Data: ${receiptDate ? formatDateBR(receiptDate + 'T12:00:00') : 'Hoje'}\n` +
          `🏷️ Categoria: ${matchCat.name}\n` +
          `📝 Descrição: ${description}\n\n` +
          `Escolha uma opção:`,
          false
        );
      } else {
        addMessage(
          `💡 Valor identificado: R$ ${receipt.amount.toFixed(2).replace('.', ',')}\n\n` +
          `⚠️ Não consegui criar a transação automaticamente.\n` +
          `Por favor, crie uma categoria primeiro:\n` +
          `• "criar categoria [nome]"`,
          false
        );
      }
    } catch (err) {
      console.error('Erro no OCR:', err);
      addMessage('Erro ao analisar a imagem. Por favor, digite os dados manualmente.', false);
    }

    setIsProcessing(false);
    e.target.value = '';
  };

  /**
   * Formata data no padrão brasileiro (DD/MM/AAAA)
   */
  const formatDateBR = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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

      {/* Área de mensagens com suporte a leitores de tela */}
      <C.MessagesArea role="log" aria-live="polite" aria-label="Mensagens do chat">
        {messages.map((message) => (
          <C.Message key={message.id} $isUser={message.isUser}>
            <C.MessageBubble
              $isUser={message.isUser}
              dangerouslySetInnerHTML={
                !message.isUser && message.text
                  ? { __html: renderMarkdown(message.text) }
                  : undefined
              }
            >
              {message.isUser || !message.text ? message.text : null}
            </C.MessageBubble>
            <C.MessageTime>{formatTime(message.timestamp)}</C.MessageTime>
          </C.Message>
        ))}
        <div ref={messagesEndRef} />
      </C.MessagesArea>

      {/* Botões de comprovante */}
      {pendingReceiptType && (
        <C.ReceiptForm>
          <C.FormRow>
            <C.FormLabel>💰 Valor:</C.FormLabel>
            <C.FormInput
              type="text"
              value={pendingReceiptType.amount}
              onChange={(e) => setPendingReceiptType({ ...pendingReceiptType, amount: e.target.value })}
              placeholder="0,00"
            />
          </C.FormRow>
          <C.FormRow>
            <C.FormLabel>📅 Data:</C.FormLabel>
            <C.FormInput
              type="date"
              value={pendingReceiptType.date}
              onChange={(e) => setPendingReceiptType({ ...pendingReceiptType, date: e.target.value })}
            />
          </C.FormRow>
          <C.FormRow>
            <C.FormLabel>🏷️ Categoria:</C.FormLabel>
            <C.FormSelect
              value={pendingReceiptType.categoryId}
              onChange={(e) => setPendingReceiptType({ ...pendingReceiptType, categoryId: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </C.FormSelect>
          </C.FormRow>
          <C.FormRow>
            <C.FormLabel>📝 Descrição:</C.FormLabel>
            <C.FormInput
              type="text"
              value={pendingReceiptType.description}
              onChange={(e) => setPendingReceiptType({ ...pendingReceiptType, description: e.target.value })}
              placeholder="Descrição"
            />
          </C.FormRow>
          <C.TypeButtons>
            <C.IncomeButton onClick={handleReceiptIncome}>
              📈 Entrada
            </C.IncomeButton>
            <C.ExpenseButton onClick={handleReceiptExpense}>
              📉 Saída
            </C.ExpenseButton>
          </C.TypeButtons>
        </C.ReceiptForm>
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
          placeholder={pendingReceiptType ? "Escolha uma opção acima" : "Pergunte sobre suas finanças..."}
          disabled={isProcessing || !!pendingReceiptType}
          aria-label="Digite sua mensagem"
        />

        <C.SendButton
          onClick={handleSend}
          disabled={!inputValue.trim() || isProcessing || !!pendingReceiptType}
          aria-label="Enviar mensagem"
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
