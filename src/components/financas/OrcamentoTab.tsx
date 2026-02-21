import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatBRL } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import type { Expense } from '@/types/database'

interface BudgetCategory {
  expense_id: string
  expense_name: string
  expense_type: string
  expense_color: string
  expense_icon: string
  expense_expected_amount: number | null
  total_spent: number
}

interface SpentRow {
  expense_id: string
  transaction_amount: number
}

interface OrcamentoTabProps {
  month: Date
}

export default function OrcamentoTab({ month }: OrcamentoTabProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).toISOString()
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59).toISOString()

    Promise.all([
      supabase.from('expenses').select('*').eq('expense_is_active', true),
      supabase
        .from('transactions')
        .select('expense_id, transaction_amount')
        .gte('transaction_datetime', startOfMonth)
        .lte('transaction_datetime', endOfMonth)
    ]).then(([expensesRes, txRes]) => {
      const expenses = (expensesRes.data ?? []) as Expense[]
      const transactions = (txRes.data ?? []) as SpentRow[]

      const spentByCategory: Record<string, number> = {}
      transactions.forEach(t => {
        spentByCategory[t.expense_id] = (spentByCategory[t.expense_id] ?? 0) + t.transaction_amount
      })

      const result: BudgetCategory[] = expenses
        .filter(e => spentByCategory[e.expense_id] !== undefined || e.expense_expected_amount)
        .map(e => ({
          expense_id: e.expense_id,
          expense_name: e.expense_name,
          expense_type: e.expense_type,
          expense_color: e.expense_color,
          expense_icon: e.expense_icon ?? '📦',
          expense_expected_amount: e.expense_expected_amount ?? null,
          total_spent: spentByCategory[e.expense_id] ?? 0,
        }))
        .sort((a, b) => b.total_spent - a.total_spent)

      setCategories(result)
      setLoading(false)
    })
  }, [month])

  const totalBudget = categories.reduce((s, c) => s + (c.expense_expected_amount ?? 0), 0)
  const totalSpent = categories.reduce((s, c) => s + c.total_spent, 0)
  const overBudget = categories.filter(c => c.expense_expected_amount && c.total_spent > c.expense_expected_amount)

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-3 w-1/2 mb-3" />
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {totalBudget > 0 && (
        <div className="card-glow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Total orçado</span>
            <span className="font-mono text-slate-300">{formatBRL(totalBudget)}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Total gasto</span>
            <span className={cn('font-mono font-semibold', totalSpent > totalBudget ? 'text-rose-400' : 'text-slate-200')}>
              {formatBRL(totalSpent)}
            </span>
          </div>
          <div className="h-2 bg-base-900 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700',
                totalSpent > totalBudget ? 'bg-rose-500' : totalSpent / totalBudget > 0.7 ? 'bg-gold-500' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-slate-500">0%</span>
            <span className={cn('text-xs font-medium', totalSpent > totalBudget ? 'text-rose-400' : 'text-slate-400')}>
              {Math.round((totalSpent / totalBudget) * 100)}% utilizado
            </span>
          </div>
        </div>
      )}

      {overBudget.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-400/10 border border-rose-400/20">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <p className="text-rose-300 text-sm">
            <strong>{overBudget.length}</strong> {overBudget.length === 1 ? 'categoria estourou' : 'categorias estouraram'} o orçamento.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {categories.map(cat => {
          const hasBudget = cat.expense_expected_amount !== null && cat.expense_expected_amount > 0
          const pct = hasBudget ? Math.min((cat.total_spent / (cat.expense_expected_amount ?? 1)) * 100, 100) : 0
          const isOver = hasBudget && cat.total_spent > (cat.expense_expected_amount ?? 0)
          const isWarning = hasBudget && pct > 70 && !isOver
          const barColor = isOver ? 'bg-rose-500' : isWarning ? 'bg-gold-500' : 'bg-emerald-500'

          return (
            <div key={cat.expense_id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: `${cat.expense_color}20` }}>
                  {cat.expense_icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200">{cat.expense_name}</span>
                    <span className={cn('font-mono text-sm font-semibold', isOver ? 'text-rose-400' : 'text-slate-200')}>
                      {formatBRL(cat.total_spent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-500">{cat.expense_type}</span>
                    {hasBudget && (
                      <span className="text-xs text-slate-500">de {formatBRL(cat.expense_expected_amount!)}</span>
                    )}
                  </div>
                </div>
              </div>

              {hasBudget ? (
                <>
                  <div className="h-1.5 bg-base-900 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={cn('text-xs font-medium', isOver ? 'text-rose-400' : isWarning ? 'text-gold-400' : 'text-slate-500')}>
                      {Math.round(pct)}%
                    </span>
                    {isOver
                      ? <span className="text-xs text-rose-400 font-medium">+ {formatBRL(cat.total_spent - (cat.expense_expected_amount ?? 0))} acima</span>
                      : <span className="text-xs text-slate-600">Resta {formatBRL((cat.expense_expected_amount ?? 0) - cat.total_spent)}</span>
                    }
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-600 italic">Sem orçamento definido</p>
              )}
            </div>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <p className="text-4xl mb-3">📊</p>
          <p>Nenhum gasto registrado este mês</p>
        </div>
      )}
    </div>
  )
}