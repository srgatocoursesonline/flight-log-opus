// ============================================
// TRANSACTION DETAIL MODAL COMPONENT
// ============================================

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/hooks/supabase/useSupabaseFinancial';
import {
  DollarSign,
  ArrowUp,
  ArrowDown,
  Calendar,
  Tag,
  X
} from 'lucide-react';
import { formatDateBR } from '@/utils/dateFormatter';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionDetailModal = ({ transaction, open, onOpenChange }: TransactionDetailModalProps) => {
  if (!transaction) return null;

  const isRevenue = transaction.type === 'revenue';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-panel">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 modal-title">
              <div className={`p-2 rounded-lg ${isRevenue ? 'bg-success/20' : 'bg-destructive/20'}`}>
                {isRevenue ? (
                  <ArrowUp className="h-5 w-5 text-success" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div>
                <span className="text-xl font-bold">
                  {isRevenue ? 'Receita' : 'Despesa'}
                </span>
                <p className="text-sm description-text font-normal">
                  {transaction.description}
                </p>
              </div>
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <DialogDescription>
            Detalhes completos da transação financeira
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Valor Principal */}
          <div className="bg-card/50 border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${isRevenue ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <DollarSign className={`h-6 w-6 ${isRevenue ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className={`text-3xl font-bold font-mono ${isRevenue ? 'text-success' : 'text-destructive'}`}>
                    {isRevenue ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`${isRevenue ? 'border-success text-success' : 'border-destructive text-destructive'}`}>
                {isRevenue ? 'Receita' : 'Despesa'}
              </Badge>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div className="flex flex-col p-4 bg-card border rounded-lg hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">Data</span>
              </div>
              <div className="mt-auto">
                <p className="text-lg font-semibold text-foreground">
                  {formatDateBR(transaction.date)}
                </p>
              </div>
            </div>

            {/* Categoria */}
            {transaction.category && (
              <div className="flex flex-col p-4 bg-card border rounded-lg hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="text-xs font-medium">Categoria</span>
                </div>
                <div className="mt-auto">
                  <p className="text-lg font-semibold text-foreground">
                    {transaction.category}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Descrição Completa */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Descrição</h3>
            <div className="p-4 bg-muted/10 rounded-lg border-l-4 border-primary">
              <p className="text-readable">"{transaction.description}"</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
