/**
 * @file components/features/TransactionChat/index.tsx
 * @description Chat rápido redesenhado com shadcn + tailwind + framer-motion + lucide.
 * Card com mensagens, Input + Button, Badge e motion. Preserva toda lógica de chat,
 * comandos, OCR, comprovantes e integração com IA advisor.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Image as ImageIcon, Trash2, Lightbulb, Loader2, TrendingUp } from 'lucide-react';
import { extractTextFromImage } from '../../../services/ocrService';
import { useTransactions } from '../../../hooks/useTransactions';
import { useInstallments } from '../../../contexts/InstallmentsContext';
import { getExampleMessages, parseTransactionFromMessage } from '../../../utils/parseTransaction';
import { detectCommand, executeCommand } from '../../../utils/chatCommands';
import { generateSummary, generateAnalysis } from '../../../utils/analysisEngine';
import { parseReceiptText, getReceiptResponse } from '../../../utils/receiptParser';
import { buildFinancialContext, streamAdvisor } from '../../../services/financialAdvisorService';
import { CardHeader, CardTitle } from '../../ui/card';
import { Button, buttonVariants } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { cn } from '../../../lib/utils';
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

  // Estado do chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingReceiptType, setPendingReceiptType] = useState<{
    description: string;
    amount: string;
    date: string;
    categoryId: string;
  } | null>(null);

  // Refs para scroll e foco
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Exemplos de mensagens
  const examples = getExampleMessages();
  const STORAGE_KEY = 'financas_chat_messages';

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

  /** Processa mensagem do usuário - comandos, OCR e IA */
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

    // 2. Texto colado de comprovante (2+ linhas)
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length >= 2) {
      const receipt = parseReceiptText(text);
      if (receipt.amount) {
        const searchTerms = [receipt.description, receipt.store].filter(Boolean).join(' ').toLowerCase();
        let matchCat = categories.find((c) => {
          const catName = c.name.toLowerCase();
          return searchTerms.includes(catName) || catName.includes(searchTerms.split(' ')[0]);
        });
        if (!matchCat) {
          matchCat = categories.find((c) => c.name.toLowerCase() === 'outros') || categories[0];
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
            ` Transação criada!\n` +
              ` ${transactionData.description}\n` +
              ` R$ ${transactionData.amount.toFixed(2).replace('.', ',')}\n` +
              ` ${formatDateBR(transactionData.date)}\n` +
              ` ${matchCat.name}`,
            false
          );
        } else {
          addMessage(` Texto reconhecido mas sem categoria.\nCrie uma com "criar categoria [nome]"`, false);
        }
        setIsProcessing(false);
        return;
      }
    }

    // 3. Tentar parsear como transação simples
    const parsed = parseTransactionFromMessage(text);
    if (parsed) {
      let matchCat = categories.find((c) => c.name.toLowerCase() === parsed.categoria.toLowerCase());
      if (!matchCat) {
        matchCat = categories.find((c) => c.name.toLowerCase() === 'outros') || categories[0];
      }
      if (matchCat) {
        const installmentCount = parsed.parcelas || 0;
        const perInstallment = installmentCount > 0 ? parsed.valor / installmentCount : parsed.valor;
        const installmentLabel = installmentCount > 0 ? `1/${installmentCount}` : '';
        const descriptionWithInstallment = installmentLabel ? `${parsed.descricao} ${installmentLabel}` : parsed.descricao;
        const transactionData: Omit<Transaction, 'id'> = {
          description: descriptionWithInstallment,
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
        addMessage(
          ` Transação registrada!\n` +
            ` ${transactionData.description}\n` +
            ` R$ ${transactionData.amount.toFixed(2).replace('.', ',')}\n` +
            ` ${formatDateBR(transactionData.date)}\n` +
            ` ${matchCat.name}` +
            (installmentCount > 0
              ? `\n Total: R$ ${parsed.valor.toFixed(2).replace('.', ',')} (${installmentCount}x)\n Parcelado criado em "Parcelados" (${installmentCount}x de R$ ${perInstallment.toFixed(2).replace('.', ',')})`
              : ''),
          false
        );
        setIsProcessing(false);
        return;
      }
    }

    // 4. Tudo o resto vai para a IA advisor (streaming)
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

  /** Confirma comprovante como entrada ou saída */
  const handleReceiptConfirm = async (type: 'income' | 'expense') => {
    if (!pendingReceiptType) return;
    const { description, amount, date, categoryId } = pendingReceiptType;
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addMessage(' Valor inválido. Verifique o valor digitado.', false);
      return;
    }
    setPendingReceiptType(null);
    const transactionData: Omit<Transaction, 'id'> = {
      description,
      amount: parsedAmount,
      type,
      date: date ? new Date(date + 'T12:00:00').toISOString() : new Date().toISOString(),
      categoryId,
      notes: '',
    };
    try {
      await addTransaction(transactionData);
      const label = type === 'income' ? ' Entrada' : ' Saída';
      addMessage(
        ` Transação criada!\n${label}: ${description}\n R$ ${parsedAmount.toFixed(2).replace('.', ',')}\n ${formatDateBR(transactionData.date)}\n ${categories.find((c) => c.id === categoryId)?.name || ''}`,
        false
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'desconhecido';
      addMessage(`Erro ao criar transação: ${msg}`, false);
    }
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

  /** Trata upload de imagem (comprovante/nota fiscal) */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addMessage('Por favor, selecione uma imagem válida.', false);
      return;
    }
    setIsProcessing(true);
    addMessage(' Analisando comprovante...', false);
    try {
      const ocrResult = await extractTextFromImage(file, 'por');
      const text = ocrResult.text;
      if (!text) {
        addMessage('Não consegui ler texto na imagem. Por favor, digite os dados manualmente.\nEx: "Mercado 150,50"', false);
        setIsProcessing(false);
        return;
      }
      const receipt = parseReceiptText(text);
      if (!receipt.amount) {
        const aiMsg: ChatMessage = { id: generateMessageId(), text: '', isUser: false, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMsg]);
        try {
          const context = buildFinancialContext(transactions, categories);
          const prompt = `Texto de comprovante/nota fiscal extraído por OCR:\n\n${text}\n\nInterprete este texto e me diga: valor, data, descrição e categoria sugerida. Se for uma transação, crie ela.`;
          let accumulated = '';
          const chunks = streamAdvisor(prompt, context, []);
          const updateAiMessage = (t: string) => {
            setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: t } : m)));
          };
          for await (const chunk of chunks) {
            accumulated += chunk;
            updateAiMessage(accumulated);
          }
        } catch {
          setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: ' Não consegui interpretar o comprovante. Por favor, digite manualmente.\nEx: "Mercado 150,50"' } : m)));
        }
        setIsProcessing(false);
        e.target.value = '';
        return;
      }
      const searchTerms = [receipt.description, receipt.store].filter(Boolean).join(' ').toLowerCase();
      let matchCat = categories.find((c) => {
        const catName = c.name.toLowerCase();
        return searchTerms.includes(catName) || catName.includes(searchTerms.split(' ')[0]);
      });
      if (!matchCat) {
        matchCat = categories.find((c) => c.name.toLowerCase() === 'outros') || categories[0];
      }
      if (matchCat) {
        const description = receipt.description || receipt.store || 'Comprovante';
        const receiptDate = receipt.date || '';
        const amountStr = receipt.amount.toFixed(2).replace('.', ',');
        setPendingReceiptType({ description, amount: amountStr, date: receiptDate, categoryId: matchCat.id });
        addMessage(
          ` Dados identificados (edite antes de confirmar):\n\n Valor: R$ ${amountStr}\n Data: ${receiptDate ? formatDateBR(receiptDate + 'T12:00:00') : 'Hoje'}\n Categoria: ${matchCat.name}\n Descrição: ${description}\n\nEscolha uma opção:`,
          false
        );
      } else {
        addMessage(` Valor identificado: R$ ${receipt.amount.toFixed(2).replace('.', ',')}\n\n Não consegui criar a transação automaticamente.\nPor favor, crie uma categoria primeiro:\n• "criar categoria [nome]"`, false);
      }
    } catch (err) {
      console.error('Erro no OCR:', err);
      addMessage('Erro ao analisar a imagem. Por favor, digite os dados manualmente.', false);
    }
    setIsProcessing(false);
    e.target.value = '';
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
      <CardHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
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
        {messages.map((message, idx) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02, duration: 0.25 }}
            className={`flex flex-col gap-1 ${message.isUser ? 'items-end' : 'items-start'}`}
          >
            {/* Badge de autor */}
            <span className={`flex items-center gap-1 text-[11px] font-medium ${message.isUser ? 'text-primary' : 'text-muted-foreground'}`}>
              {message.isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              {message.isUser ? 'Você' : 'Assistente'}
            </span>
            {/* Balão da mensagem */}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                message.isUser
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-background border text-foreground rounded-bl-md'
              }`}
            >
              {message.isUser || !message.text ? (
                message.text
              ) : (
                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
              )}
            </div>
            <span className="text-[11px] text-muted-foreground px-1">{formatTime(message.timestamp)}</span>
          </motion.div>
        ))}
        {/* Indicador de processamento */}
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulário de comprovante pendente */}
      <AnimatePresence>
        {pendingReceiptType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-amber-50/60 dark:bg-amber-500/10 p-3 space-y-2.5 overflow-hidden"
          >
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" />
              Dados identificados (edite antes de confirmar)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Valor</Label>
                <Input value={pendingReceiptType.amount} onChange={(e) => setPendingReceiptType({ ...pendingReceiptType!, amount: e.target.value })} placeholder="0,00" className="h-8 rounded-lg text-sm bg-background" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input type="date" value={pendingReceiptType.date} onChange={(e) => setPendingReceiptType({ ...pendingReceiptType!, date: e.target.value })} className="h-8 rounded-lg text-sm bg-background" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Categoria</Label>
              <Select value={pendingReceiptType.categoryId} onValueChange={(v) => setPendingReceiptType({ ...pendingReceiptType!, categoryId: v })}>
                <SelectTrigger className="h-8 rounded-lg text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Descrição</Label>
              <Input value={pendingReceiptType.description} onChange={(e) => setPendingReceiptType({ ...pendingReceiptType!, description: e.target.value })} placeholder="Descrição" className="h-8 rounded-lg text-sm bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button onClick={() => handleReceiptConfirm('income')} className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 h-9 text-sm">
                <TrendingUp className="h-4 w-4" />
                Entrada
              </Button>
              <Button onClick={() => handleReceiptConfirm('expense')} variant="destructive" className="rounded-xl gap-1.5 h-9 text-sm">
                <TrendingUp className="h-4 w-4 rotate-180" />
                Saída
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de mensagem */}
      <div className="p-3 border-t bg-background flex items-center gap-2">
        {/* Botão upload de imagem */}
        <label
          htmlFor="chat-image-upload"
          className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-9 w-9 rounded-xl shrink-0 cursor-pointer')}
          title="Enviar foto de comprovante"
        >
          <ImageIcon className="h-4 w-4" />
        </label>
        <input type="file" id="chat-image-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />

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
          placeholder={pendingReceiptType ? 'Escolha uma opção acima' : 'Pergunte sobre suas finanças...'}
          disabled={isProcessing || !!pendingReceiptType}
          aria-label="Digite sua mensagem"
          className="flex-1 h-9 rounded-xl"
        />

        <Button onClick={handleSend} disabled={!inputValue.trim() || isProcessing || !!pendingReceiptType} size="icon" className="h-9 w-9 rounded-xl shrink-0" aria-label="Enviar mensagem">
          <Send className="h-4 w-4" />
        </Button>
      </div>

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
