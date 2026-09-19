/**
 * @file pages/EmergencyReserve/index.tsx
 * @description Página de Reserva de Emergência — bento premium, meta, progresso, depósito/saque.
 * Calcula sugestão ideal (6x despesas mensais) e permite gerenciar saldo guardado.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Info,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { useEmergencyReserve } from '../../contexts/EmergencyReserveContext';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency } from '../../utils/formatters';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';

const EmergencyReservePage: React.FC = () => {
  const { reserve, isLoading, create, updateGoal, updateCurrentAmount, deposit, withdraw, remove } =
    useEmergencyReserve();
  const { transactions } = useTransactions();

  const [goalInput, setGoalInput] = useState('');
  const [initialAmountInput, setInitialAmountInput] = useState('');
  const [depositInput, setDepositInput] = useState('');
  const [withdrawInput, setWithdrawInput] = useState('');
  const [currentAmountInput, setCurrentAmountInput] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcula despesas médias mensais (últimos 3 meses) para sugestão ideal 6x
  const suggestedGoal = useMemo(() => {
    const now = new Date();
    let totalExpense = 0;
    let monthsCount = 0;
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpense = transactions
        .filter((t) => {
          const td = new Date(t.date);
          return (
            td.getMonth() === d.getMonth() &&
            td.getFullYear() === d.getFullYear() &&
            t.type === 'expense'
          );
        })
        .reduce((s, t) => s + t.amount, 0);
      if (monthExpense > 0) {
        totalExpense += monthExpense;
        monthsCount++;
      }
    }
    const avg =
      monthsCount > 0
        ? totalExpense / monthsCount
        : transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) / 3 ||
          0;
    return Math.round(avg * 6);
  }, [transactions]);

  const progress =
    reserve && reserve.goalAmount > 0
      ? Math.min(100, (reserve.currentAmount / reserve.goalAmount) * 100)
      : 0;
  const remaining = reserve ? Math.max(0, reserve.goalAmount - reserve.currentAmount) : 0;
  const isCompleted = reserve
    ? reserve.currentAmount >= reserve.goalAmount && reserve.goalAmount > 0
    : false;

  const handleCreate = async () => {
    const goal = parseFloat(goalInput.replace(',', '.'));
    if (!goal || goal <= 0) {
      setError('Informe uma meta válida');
      return;
    }
    const initialStr = initialAmountInput.trim().replace(',', '.');
    const initial = initialStr ? parseFloat(initialStr) : 0;
    if (initialStr && (isNaN(initial) || initial < 0)) {
      setError('Valor inicial inválido');
      return;
    }
    setError(null);
    try {
      await create(goal, initial);
      setGoalInput('');
      setInitialAmountInput('');
      setIsEditingGoal(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleUpdateGoal = async () => {
    const goal = parseFloat(goalInput.replace(',', '.'));
    if (!goal || goal <= 0) {
      setError('Informe uma meta válida');
      return;
    }
    setError(null);
    try {
      await updateGoal(goal);
      setGoalInput('');
      setIsEditingGoal(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDeposit = async () => {
    const val = parseFloat(depositInput.replace(',', '.'));
    if (!val || val <= 0) {
      setError('Informe um valor para depositar');
      return;
    }
    setError(null);
    try {
      await deposit(val);
      setDepositInput('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(withdrawInput.replace(',', '.'));
    if (!val || val <= 0) {
      setError('Informe um valor para sacar');
      return;
    }
    setError(null);
    try {
      await withdraw(val);
      setWithdrawInput('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleUpdateCurrentAmount = async () => {
    const val = parseFloat(currentAmountInput.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      setError('Informe um valor válido para definir');
      return;
    }
    setError(null);
    try {
      await updateCurrentAmount(val);
      setCurrentAmountInput('');
      setIsEditingAmount(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground">
            Carregando reserva...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-600">
                <PiggyBank size={18} />
              </span>
              Reserva de Emergência
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">
              Sua rede de segurança financeira — ideal é 6 meses de despesas. Acompanhe progresso e
              movimente quando precisar.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit rounded-full px-3 py-1.5 gap-1.5 text-xs font-medium shrink-0"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {reserve ? `${progress.toFixed(0)}% concluído` : 'Sem reserva'}
          </Badge>
        </div>
      </motion.div>

      {/* Métricas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5"
      >
        <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-violet-500 to-purple-500" />
          <CardContent className="p-[18px] flex items-center gap-3.5">
            <span className="w-[42px] h-[42px] flex items-center justify-center rounded-xl border bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent">
              <Wallet size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                Meta definida
              </span>
              <strong className="block mt-1.5 text-[18px] font-bold tracking-tight">
                {reserve ? formatCurrency(reserve.goalAmount) : '—'}
              </strong>
              <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {reserve ? 'Editável' : 'Crie sua meta'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-500 to-teal-500" />
          <CardContent className="p-[18px] flex items-center gap-3.5">
            <span className="w-[42px] h-[42px] flex items-center justify-center rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent">
              <PiggyBank size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                Guardado
              </span>
              <strong className="block mt-1.5 text-[18px] font-bold tracking-tight">
                {reserve ? formatCurrency(reserve.currentAmount) : formatCurrency(0)}
              </strong>
              <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {reserve ? `${progress.toFixed(1)}% da meta` : 'Comece agora'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden rounded-2xl border bg-card shadow-sm ${isCompleted ? 'ring-1 ring-emerald-500/20' : ''}`}
        >
          <span
            className={`absolute left-0 top-0 bottom-0 w-[3px] ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-b from-amber-500 to-orange-500'}`}
          />
          <CardContent className="p-[18px] flex items-center gap-3.5">
            <span
              className={`w-[42px] h-[42px] flex items-center justify-center rounded-xl border ${isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent' : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-transparent'}`}
            >
              {isCompleted ? <ShieldCheck size={16} /> : <TrendingUp size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                {isCompleted ? 'Completa!' : 'Falta guardar'}
              </span>
              <strong className="block mt-1.5 text-[18px] font-bold tracking-tight">
                {reserve ? formatCurrency(remaining) : formatCurrency(suggestedGoal)}
              </strong>
              <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {isCompleted ? 'Meta batida' : 'Para atingir a meta'}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Erro - mensagem amigável ao usuário, detalhes técnicos apenas no console */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl shrink-0 h-7 px-2 text-xs"
              onClick={() => setError(null)}
            >
              Dispensar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Conteúdo principal */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        {/* Progresso e barra */}
        <Card className="rounded-2xl border shadow-sm overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {!reserve ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <PiggyBank className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-[16px] font-semibold">Crie sua reserva</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Defina meta e valor já guardado (opcional)
                </p>
                <div className="max-w-xs mx-auto mt-4 space-y-2">
                  <Input
                    placeholder={`Meta ex: ${suggestedGoal}`}
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="Valor já guardado (opcional) ex: 1500"
                    value={initialAmountInput}
                    onChange={(e) => setInitialAmountInput(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button onClick={handleCreate} className="w-full rounded-xl">
                    Criar reserva
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 rounded-full text-xs"
                  onClick={() => setGoalInput(String(suggestedGoal))}
                >
                  Usar sugestão {formatCurrency(suggestedGoal)}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-emerald-600" /> Progresso
                  </h3>
                  <Badge
                    variant={isCompleted ? 'default' : 'secondary'}
                    className={`rounded-full ${isCompleted ? 'bg-emerald-600' : ''}`}
                  >
                    {progress.toFixed(1)}%
                  </Badge>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(reserve.currentAmount)} guardados</span>
                  <span>Meta {formatCurrency(reserve.goalAmount)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border bg-muted/30 p-3 text-center">
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                      Guardado
                    </p>
                    <p className="text-[15px] font-bold mt-1">
                      {formatCurrency(reserve.currentAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/30 p-3 text-center">
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                      Falta
                    </p>
                    <p className="text-[15px] font-bold mt-1">{formatCurrency(remaining)}</p>
                  </div>
                </div>
                {isCompleted && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 p-3 flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4" /> Parabéns! Sua reserva está completa.
                    Mantenha para imprevistos.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="rounded-2xl border shadow-sm overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {!reserve ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Crie uma reserva para habilitar depósitos e saques.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-emerald-600" /> Depositar
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0,00"
                      value={depositInput}
                      onChange={(e) => setDepositInput(e.target.value)}
                      className="rounded-xl"
                    />
                    <Button
                      onClick={handleDeposit}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    >
                      Depositar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Minus className="h-3.5 w-3.5 text-red-500" /> Sacar
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0,00"
                      value={withdrawInput}
                      onChange={(e) => setWithdrawInput(e.target.value)}
                      className="rounded-xl"
                    />
                    <Button variant="outline" onClick={handleWithdraw} className="rounded-xl">
                      Sacar
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Definir valor guardado
                  </Label>
                  {!isEditingAmount ? (
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2 rounded-xl border bg-muted text-sm font-medium">
                        {formatCurrency(reserve.currentAmount)}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingAmount(true);
                          setCurrentAmountInput(String(reserve.currentAmount));
                        }}
                        className="rounded-xl"
                      >
                        Definir
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={currentAmountInput}
                        onChange={(e) => setCurrentAmountInput(e.target.value)}
                        className="rounded-xl"
                        autoFocus
                        placeholder="0,00"
                      />
                      <Button
                        onClick={handleUpdateCurrentAmount}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditingAmount(false)}
                        className="rounded-xl"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Defina diretamente o valor total já guardado, sem precisar depositar aos poucos.
                  </p>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 text-muted-foreground" /> Editar meta
                  </Label>
                  {!isEditingGoal ? (
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2 rounded-xl border bg-muted text-sm font-medium">
                        {formatCurrency(reserve.goalAmount)}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingGoal(true);
                          setGoalInput(String(reserve.goalAmount));
                        }}
                        className="rounded-xl"
                      >
                        Editar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="rounded-xl"
                        autoFocus
                      />
                      <Button onClick={handleUpdateGoal} className="rounded-xl">
                        Salvar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditingGoal(false)}
                        className="rounded-xl"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => setGoalInput(String(suggestedGoal))}
                  >
                    Sugerir {formatCurrency(suggestedGoal)} (6x)
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={remove}
                    className="w-full rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir reserva
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {reserve && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="rounded-2xl border-dashed bg-muted/20">
              <CardContent className="p-4 flex gap-3">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 h-fit">
                  <Info className="h-4 w-4" />
                </span>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Dica:</strong> especialistas recomendam 3 a
                    6 meses de despesas. Com base nos seus últimos gastos, o ideal é{' '}
                    <strong className="text-foreground">{formatCurrency(suggestedGoal)}</strong>.
                  </p>
                  <p className="mt-1">
                    Deposite quando receber e só saque em real emergência. Acompanhe o progresso no
                    Dashboard em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyReservePage;
