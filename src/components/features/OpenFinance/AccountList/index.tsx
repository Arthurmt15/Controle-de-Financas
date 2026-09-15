/**
 * @file src/components/features/OpenFinance/AccountList/index.tsx
 * @description Lista de contas com shadcn + tailwind + framer-motion + lucide.
 * Cards com faixa lateral, Badge de tipo e animação em cascata.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, PiggyBank, CreditCard, TrendingUp, Wallet, Eye, Trash2, Loader2 } from 'lucide-react';
import { OpenFinanceAccount } from '../../../../types/openFinance';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

/** Props do AccountList */
interface AccountListProps {
  accounts: OpenFinanceAccount[];
  loading: boolean;
  onSelectAccount: (accountId: string) => void;
  selectedAccountId: string | null;
}

/** Formata moeda BRL */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

/** Retorna ícone lucide conforme tipo de conta */
function getAccountIcon(type: string) {
  const map: Record<string, React.ElementType> = {
    CHECKING: Landmark,
    SAVINGS: PiggyBank,
    CREDIT_CARD: CreditCard,
    INVESTMENT: TrendingUp,
    LOAN: Wallet,
  };
  return map[type] ?? Wallet;
}

/** Lista de contas financeiras conectadas — shadcn */
const AccountList: React.FC<AccountListProps> = ({ accounts, loading, onSelectAccount, selectedAccountId }) => {
  const { removeItem } = useOpenFinance();

  /** Remove conexão após confirmação */
  const handleRemove = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja desconectar esta instituição?')) {
      await removeItem(itemId);
    }
  };

  // Estado de carregamento com spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-muted-foreground gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando contas...
      </div>
    );
  }

  if (accounts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      {accounts.map((account, idx) => {
        const Icon = getAccountIcon(account.type);
        const isSelected = selectedAccountId === account.id;
        const isPositive = account.balance >= 0;

        return (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.35 }}
            onClick={() => onSelectAccount(account.id)}
            className="cursor-pointer"
          >
            <Card
              className={`relative overflow-hidden rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5 ${
                isSelected ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'border'
              }`}
            >
              {/* Faixa lateral indicando seleção */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px] opacity-90"
                style={{
                  background: isSelected
                    ? 'linear-gradient(180deg,#6366f1,#8b5cf6)'
                    : isPositive
                      ? 'linear-gradient(180deg,#10b981,#06b6d4)'
                      : 'linear-gradient(180deg,#ef4444,#f97316)',
                }}
              />
              <CardContent className="p-5">
                {/* Cabeçalho: ícone + nome + badge tipo */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-muted border-transparent text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold leading-none truncate">{account.name}</h3>
                      <Badge variant="outline" className="mt-1.5 rounded-full text-[10px] px-2 py-0 font-medium tracking-widest uppercase">
                        {account.type}
                      </Badge>
                    </div>
                  </div>
                  {/* Botão remover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={(e) => handleRemove(account.itemId, e)}
                    aria-label="Desconectar instituição"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Detalhes agência/conta */}
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground font-normal text-xs">
                    Ag: {account.branch || '—'}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground font-normal text-xs">
                    Conta: {account.number || '—'}
                  </Badge>
                </div>

                {/* Saldo com cor semântica */}
                <div className={`text-[20px] font-bold tracking-tight mb-4 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatCurrency(account.balance)}
                </div>

                {/* Ação principal */}
                <Button
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  className="rounded-xl w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAccount(account.id);
                  }}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  {isSelected ? 'Selecionada' : 'Ver transações'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AccountList;
