import React from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
  CreditCard,
  CalendarClock,
  Search,
} from 'lucide-react';

const ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transações', path: '/transactions', icon: Receipt },
  { label: 'Análise', path: '/analysis', icon: BarChart3 },
  { label: 'Parcelados', path: '/installments', icon: CreditCard },
  { label: 'Gastos Futuros', path: '/future-expenses', icon: CalendarClock },
  { label: 'Configurações', path: '/settings', icon: Settings },
];

export const CommandPalette: React.FC<{ open: boolean; onOpenChange: (o: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] p-4 bg-black/40 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border bg-popover text-popover-foreground shadow-2xl overflow-hidden"
      >
        <Command className="p-0">
          <div className="flex items-center gap-2 px-3 border-b">
            <Search size={16} className="text-muted-foreground" />
            <Command.Input
              placeholder="Ir para..."
              className="flex-1 h-11 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <Command.List className="p-2 max-h-72 overflow-auto">
            <Command.Empty className="p-4 text-sm text-muted-foreground text-center">
              Nenhum resultado.
            </Command.Empty>
            <Command.Group
              heading="Navegação"
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              {ITEMS.map(({ label, path, icon: Icon }) => (
                <Command.Item
                  key={path}
                  onSelect={() => {
                    navigate(path);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent"
                >
                  <Icon size={16} /> {label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="px-3 py-2 border-t text-xs text-muted-foreground flex justify-between">
            <span>↵ para selecionar</span>
            <span>⌘K para fechar</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
