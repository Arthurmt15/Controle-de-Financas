/**
 * @file components/features/TransactionList/MobileDownloadBar.tsx
 * @description Barra de download visível só no mobile (md:hidden), fixa ao rolar
 * a lista de transações. Botões grandes (alvo de toque 48px) para baixar as
 * transações filtradas em CSV ou PDF. No celular usa o menu nativo de
 * compartilhamento (Web Share API) com fallback para download tradicional.
 */

import React from 'react';
import { BookDown, Rocket, Sheet } from 'lucide-react';
import { Button } from '../../ui/button';
import { exportTransactionsCSV, exportTransactionsPDF } from '../../../utils/exportData';
import { playSound, playHover } from '../../../utils/sounds';
import type { Transaction, Category } from '../../../types';

interface MobileDownloadBarProps {
  transactions: Transaction[];
  categories: Category[];
}

const MobileDownloadBar: React.FC<MobileDownloadBarProps> = ({ transactions, categories }) => {
  const isEmpty = transactions.length === 0;

  return (
    <div
      className="md:hidden sticky z-40 bottom-[calc(1rem+env(safe-area-inset-bottom))]"
      aria-label="Baixar transações"
    >
      <div className="rounded-2xl border bg-background/95 backdrop-blur shadow-lg p-2">
        <p className="flex items-center gap-1.5 px-2 pb-2 pt-1 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
          <Rocket className="h-3.5 w-3.5" />
          Baixar {transactions.length} {transactions.length === 1 ? 'item' : 'itens'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            className="h-12 rounded-xl gap-2 text-sm"
            disabled={isEmpty}
            onClick={() => {
              exportTransactionsCSV({ transactions, categories });
              playSound('success');
            }}
            onMouseEnter={playHover}
            aria-label="Baixar transações em CSV"
          >
            <Sheet className="h-5 w-5 text-emerald-300" />
            Baixar CSV
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl gap-2 text-sm"
            disabled={isEmpty}
            onClick={() => {
              exportTransactionsPDF({ transactions, categories });
              playSound('success');
            }}
            onMouseEnter={playHover}
            aria-label="Baixar transações em PDF"
          >
            <BookDown className="h-5 w-5" />
            Baixar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileDownloadBar;
