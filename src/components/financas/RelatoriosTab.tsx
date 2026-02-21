import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatBRL, formatBRLCompact } from '@/lib/utils'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthlyData {
  month: string
  receitas: number
  despesas: number
}

interface CategoryData {
  name: string
  value: number
  color: string
  icon: string
}

interface AmountRow { transaction_amount: number }
interface RevenueRow { revenue_amount: number }
interface TxWithExpense {
  transaction_amount: number
  expense: { expense_name: string; expense_color: string; expense_icon: string } | null
}

interface RelatoriosTabProps {
  month: Date
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; color: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-base-800 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-2 font-medium capitalize">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name === 'receitas' ? 'Receitas' : 'Despesas'}:</span>
          <span className="font-mono font-medium text-slate-100">{formatBRL(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RelatoriosTab({ month }: RelatoriosTabProps) {
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [byCategory, setByCategory] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const months = Array.from({ length: 6 }, (_, i) => subMonths(month, 5 - i))

      const monthlyData = await Promise.all(months.map(async m => {
        const start = startOfMonth(m).toISOString()
        const end = endOfMonth(m).toISOString()

        const [txRes, revRes] = await Promise.all([
          supabase.from('transactions').select('transaction_amount').gte('transaction_datetime', start).lte('transaction_datetime', end),
          supabase.from('revenues').select('revenue_amount').gte('revenue_datetime', start).lte('revenue_datetime', end),
        ])

        const despesas = ((txRes.data ?? []) as AmountRow[]).reduce((s, t) => s + t.transaction_amount, 0)
        const receitas = ((revRes.data ?? []) as RevenueRow[]).reduce((s, r) => s + r.revenue_amount, 0)

        return { month: format(m, 'MMM', { locale: ptBR }), receitas, despesas }
      }))

      setMonthly(monthlyData)

      const start = startOfMonth(month).toISOString()
      const end = endOfMonth(month).toISOString()

      const { data: txData } = await supabase
        .from('transactions')
        .select('transaction_amount, expense:expenses(expense_name, expense_color, expense_icon)')
        .gte('transaction_datetime', start)
        .lte('transaction_datetime', end)

      const catMap: Record<string, { value: number; color: string; icon: string }> = {}
      ;((txData ?? []) as unknown as TxWithExpense[]).forEach(t => {
        const name = t.expense?.expense_name ?? 'Outros'
        if (!catMap[name]) catMap[name] = { value: 0, color: t.expense?.expense_color ?? '#6B7280', icon: t.expense?.expense_icon ?? '📦' }
        catMap[name].value += t.transaction_amount
      })

      const catData = Object.entries(catMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)

      setByCategory(catData)
      setLoading(false)
    }

    load()
  }, [month])

  const currentMonth = monthly[monthly.length - 1]
  const balance = currentMonth ? currentMonth.receitas - currentMonth.despesas : 0

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Receitas</p>
          <p className="font-mono text-emerald-400 font-semibold text-sm">{formatBRLCompact(currentMonth?.receitas ?? 0)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Despesas</p>
          <p className="font-mono text-rose-400 font-semibold text-sm">{formatBRLCompact(currentMonth?.despesas ?? 0)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-500 mb-1">Saldo</p>
          <p className={`font-mono font-semibold text-sm ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {balance >= 0 ? '+' : ''}{formatBRLCompact(balance)}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Histórico 6 meses</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly} barGap={4} barSize={18}>
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatBRLCompact(v as number)} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" fill="#F43F5E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Receitas
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />Despesas
          </span>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Gastos por categoria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatBRL(value), '']}
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#CBD5E1' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col gap-2 mt-2">
            {byCategory.map(cat => {
              const total = byCategory.reduce((s, c) => s + c.value, 0)
              const pct = Math.round((cat.value / total) * 100)
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-base w-6 text-center flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300 truncate">{cat.name}</span>
                      <span className="font-mono text-xs text-slate-400 flex-shrink-0 ml-2">{formatBRL(cat.value)}</span>
                    </div>
                    <div className="h-1 bg-base-900 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 w-8 text-right flex-shrink-0">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}