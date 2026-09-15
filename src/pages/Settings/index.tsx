/**
 * @file pages/Settings/index.tsx
 * @description Página de configurações redesenhada com shadcn + tailwind + framer-motion.
 * Header gradiente, Tabs em Card e conteúdo animado.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Wallet, Layers, Settings2 } from 'lucide-react';
import CategoryManager from '../../components/features/CategoryManager';
import BudgetManager from '../../components/features/BudgetManager';
import BulkTransactionForm from '../../components/features/BulkTransactionForm';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

/** Tipo das abas */
type SettingsTab = 'categories' | 'budget' | 'bulk';

/** Configuração das abas com ícones lucide */
const TABS: { id: SettingsTab; label: string; icon: React.ElementType; hint: string }[] = [
  { id: 'categories', label: 'Categorias', icon: Tags, hint: 'Crie e organize categorias' },
  { id: 'budget', label: 'Orçamento', icon: Wallet, hint: 'Defina limites mensais' },
  { id: 'bulk', label: 'Adicionar Múltiplos', icon: Layers, hint: 'Lance vários itens de uma vez' },
];

/** Página de Configurações — shadcn */
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories');

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* Cabeçalho com gradiente */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
            <Settings2 className="h-4.5 w-4.5" size={18} />
          </span>
          <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Configurações
          </h1>
        </div>
        <p className="text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">
          Gerencie categorias, orçamentos mensais e lançamentos em lote.
        </p>
      </motion.div>

      {/* Navegação por abas — Card com Buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45 }} className="mt-5">
        <Card className="rounded-2xl">
          <CardContent className="p-1.5 sm:p-2 flex gap-1.5 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[124px] rounded-xl justify-center gap-2 whitespace-nowrap ${
                    isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  size="default"
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-[13px]">{tab.label.split(' ')[0]}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Hint da aba ativa */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
            {TABS.find((t) => t.id === activeTab)?.hint}
          </Badge>
        </div>
      </motion.div>

      {/* Conteúdo animado da aba */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4 }} className="mt-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'categories' && <CategoryManager />}
                {activeTab === 'budget' && <BudgetManager />}
                {activeTab === 'bulk' && <BulkTransactionForm />}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
