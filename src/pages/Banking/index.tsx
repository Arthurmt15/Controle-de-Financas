import { Landmark } from 'lucide-react';
import BankConnections from '../../components/features/BankConnections';

export default function BankingPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
            <Landmark className="h-[18px] w-[18px]" />
          </span>
          <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight">Contas bancárias</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-[600px]">
          Conecte suas contas pelo Open Finance e importe transações automaticamente.
        </p>
      </div>
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
        <BankConnections />
      </div>
    </div>
  );
}
