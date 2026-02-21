import { useState } from 'react'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { formatBRL, formatDateTime } from '@/lib/utils'
import { useRevenues } from '@/hooks/useRevenues'
import RevenueForm from './RevenueForm'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  'Salário':      '#10B981',
  'Pró-labore':   '#0EA5E9',
  'Dividendo PJ': '#F59E0B',
  'Freelance':    '#8B5CF6',
  'Aluguel':      '#F97316',
  'Investimento': '#14B8A6',
  'Outro':        '#6B7280',
}

interface ReceitasTabProps {
  month: Date
}

export default function ReceitasTab({ month }: ReceitasTabProps) {
  const { revenues, loading, total, addRevenue, deleteRevenue } = useRevenues(month)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    try { await deleteRevenue(id) }
    finally { setDeletingId(null) }
  }

  // Agrupa por tipo para o resumo
  const byType = revenues.reduce<Record<string, number>>((acc, r) => {
    acc[r.revenue_type] = (acc[r.revenue_type] ?? 0) + r.revenue_amount
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">

      {/* Total de receitas */}
      <div className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f2d1a 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <p className="text-emerald-400/70 text-sm">Total recebido no mês</p>
        <p className="font-mono text-3xl font-bold text-emerald-400 mt-1">
          {loading ? <span className="skeleton h-8 w-36 block" /> : formatBRL(total)}
        </p>
        {Object.keys(byType).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(byType).map(([type, value]) => (
              <span key={type}
                className="chip text-xs px-2.5 py-1"
                style={{ backgroundColor: `${TYPE_COLORS[type] ?? '#6B7280'}20`, color: TYPE_COLORS[type] ?? '#9CA3AF' }}>
                {type}: {formatBRL(value)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Botão nova receita */}
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all active:scale-98"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Nova receita</span>
      </button>

      {/* Lista de receitas */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-2xl" />
              <div className="flex-1">
                <div className="skeleton h-3 w-2/3 mb-2" />
                <div className="skeleton h-2 w-1/3" />
              </div>
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      ) : revenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <TrendingUp className="w-10 h-10 text-slate-700" />
          <p className="text-slate-500 text-sm">Nenhuma receita registrada</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {revenues.map(revenue => (
            <div key={revenue.revenue_id} className="card flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${TYPE_COLORS[revenue.revenue_type] ?? '#6B7280'}20` }}
              >
                <TrendingUp className="w-4 h-4" style={{ color: TYPE_COLORS[revenue.revenue_type] ?? '#9CA3AF' }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">
                  {revenue.revenue_description || revenue.revenue_type}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="chip px-2 py-0.5 text-xs"
                    style={{ backgroundColor: `${TYPE_COLORS[revenue.revenue_type] ?? '#6B7280'}15`, color: TYPE_COLORS[revenue.revenue_type] ?? '#9CA3AF' }}>
                    {revenue.revenue_type}
                  </span>
                  <span className="text-xs text-slate-600">{formatDateTime(revenue.revenue_datetime)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono font-semibold text-emerald-400 text-sm">
                  + {formatBRL(revenue.revenue_amount)}
                </span>
                <button
                  onClick={() => handleDelete(revenue.revenue_id)}
                  disabled={deletingId === revenue.revenue_id}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-slate-600',
                    'hover:text-rose-400 hover:bg-rose-400/10 transition-colors',
                    'opacity-0 group-hover:opacity-100 focus:opacity-100'
                  )}
                >
                  {deletingId === revenue.revenue_id
                    ? <span className="w-3 h-3 border border-slate-500 border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-3 h-3" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RevenueForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={addRevenue}
      />
    </div>
  )
}
