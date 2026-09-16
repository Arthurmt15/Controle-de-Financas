/**
 * @file pages/Transactions/index.tsx
 * @description Página de transações redesenhada com shadcn + tailwind + framer-motion.
 * Visual bento com header gradiente, tabs shadcn (Button group), grid ChatLayout
 * e wrappers Card. Mantém toda lógica de tabs existente (chat/form).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FileText, Wallet, Info, Sparkles } from 'lucide-react';
import TransactionChat from '../../components/features/TransactionChat';
import TransactionForm from '../../components/features/TransactionForm';
import TransactionList from '../../components/features/TransactionList';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

/**
 * Página de Transações - design system shadcn
 * Alterna entre Chat Rápido e Formulário, exibe lista abaixo.
 */
const TransactionsPage: React.FC = () => {
  // Controla aba ativa: chat (assistente + upload) ou form (formulário manual)
  const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* Cabeçalho bento com título em gradiente */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            {/* Título com gradiente sutil - espelha Installments */}
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary">
                <Wallet size={18} />
              </span>
              Transações
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">
              Registre gastos por chat ou formulário e acompanhe tudo na lista
            </p>
          </div>
          {/* Badge indicativo da aba ativa */}
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1.5 gap-1.5 text-xs font-medium shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {activeTab === 'chat' ? 'Chat Rápido ativo' : 'Formulário ativo'}
          </Badge>
        </div>

        {/* Hint informativo - borda tracejada como em Installments */}
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-3 flex gap-2.5 items-start">
            <span className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Info className="h-3.5 w-3.5" />
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Digite &quot;almoço 25&quot; no chat ou use o formulário. Transações parceladas criam automaticamente um item em Parcelados.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs shadcn - Button group dentro de Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="mt-5"
      >
        <Card className="rounded-2xl p-1.5 bg-muted/40 border shadow-sm">
          <div className="grid grid-cols-2 gap-1.5">
            {/* Botão Chat Rápido */}
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              className={`rounded-xl h-10 font-semibold gap-2 ${activeTab === 'chat' ? 'shadow-sm' : 'hover:bg-background'}`}
            >
              <MessageCircle className="h-4 w-4" />
              Chat Rápido
            </Button>
            {/* Botão Formulário */}
            <Button
              variant={activeTab === 'form' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('form')}
              className={`rounded-xl h-10 font-semibold gap-2 ${activeTab === 'form' ? 'shadow-sm' : 'hover:bg-background'}`}
            >
              <FileText className="h-4 w-4" />
              Formulário
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Conteúdo baseado na aba ativa - com animação AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-5"
        >
          {activeTab === 'chat' ? (
            <Card className="rounded-2xl border shadow-sm overflow-hidden">
              <TransactionChat />
            </Card>
          ) : (
            // Formulário em Card bento
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <TransactionForm />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Seção da lista - com animação suave */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="mt-6">
        <TransactionList />
      </motion.div>
    </div>
  );
};

export default TransactionsPage;
