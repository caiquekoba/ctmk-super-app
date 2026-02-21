import { useState } from 'react'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Receipt } from 'lucide-react'
import { formatBRL } from '@/lib/utils'
import type { TransactionWithRels } from '@/hooks/useTransactions'
import { cn } from '@/lib/utils'

interface TransactionListProps {
  transactions: TransactionWithRels[]
  loading: boolean
  onDelete: (id: string) => Promise<void>
}

function groupByDate(transactions: TransactionWithRels[]) {
  const groups: Record<string, TransactionWithRels[]> = {}
  transactions.forEach(t => {
    const key = t.transaction_datetime.split('T')[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function dateLabel(dateStr: string) {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
}

function TransactionItem({ transaction, onDelete }: {
  transaction: TransactionWithRels
  onDelete: (id: string) => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try { await onDelete(transaction.transaction_id) }
    finally { setDeleting(false); setShowConfirm(false) }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group">
      {/* Ícone da categoria */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${transaction.expense?.expense_color ?? '#6366F1'}20` }}
      >
        {transaction.expense?.expense_icon ?? '📦'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate font-medium">
          {transaction.transaction_description || transaction.expense?.expense_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{transaction.expense?.expense_name}</span>
          {transaction.bank && (
            <>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: transaction.bank.bank_color }} />
                {transaction.bank.bank_name}
              </span>
            </>
          )}
          {transaction.transaction_installments > 1 && (
            <>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-gold-400">
                {transaction.transaction_installment_current}/{transaction.transaction_installments}x
              </span>
            </>
          )}
        </div>
      </div>

      {/* Valor */}
      <div className="text-right flex-shrink-0">
        <p className="font-mono font-semibold text-rose-400 text-sm">
          - {formatBRL(transaction.transaction_amount)}
        </p>
      </div>

      {/* Delete */}
      {showConfirm ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setShowConfirm(false)} className="text-xs text-slate-500 px-2 py-1">Não</button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-rose-400 bg-rose-400/10 px-3 py-1 rounded-lg font-medium"
          >
            {deleting ? '...' : 'Sim'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-slate-600',
            'hover:text-rose-400 hover:bg-rose-400/10 transition-colors flex-shrink-0',
            'opacity-0 group-hover:opacity-100 focus:opacity-100'
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default function TransactionList({ transactions, loading, onDelete }: TransactionListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-3 w-24 mb-3" />
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="skeleton w-10 h-10 rounded-2xl" />
                <div className="flex-1">
                  <div className="skeleton h-3 w-2/3 mb-2" />
                  <div className="skeleton h-2 w-1/3" />
                </div>
                <div className="skeleton h-3 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-base-800 border border-white/5 flex items-center justify-center">
          <Receipt className="w-8 h-8 text-slate-600" />
        </div>
        <div className="text-center">
          <p className="text-slate-400 font-medium">Nenhum lançamento</p>
          <p className="text-slate-600 text-sm mt-1">Toque no + para registrar uma despesa</p>
        </div>
      </div>
    )
  }

  const groups = groupByDate(transactions)

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([date, items]) => (
        <div key={date} className="card">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider capitalize">
              {dateLabel(date)}
            </span>
            <span className="font-mono text-xs text-rose-400 font-medium">
              - {formatBRL(items.reduce((s, t) => s + t.transaction_amount, 0))}
            </span>
          </div>
          {items.map(t => (
            <TransactionItem key={t.transaction_id} transaction={t} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  )
}
