import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatBRL, formatDate, getInitials, currentMonthLabel } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database'

// ── Tipos locais ─────────────────────────────────────────────

interface BankBalance {
  bank_id: string
  bank_name: string
  bank_color: string
  bank_icon?: string
  current_balance: number
}

interface MonthlySummary {
  totalRevenues: number
  totalExpenses: number
  balance: number
}

// ── Componentes auxiliares ────────────────────────────────────

function StatCard({ label, value, trend, color }: {
  label: string
  value: number
  trend?: number
  color: 'emerald' | 'rose' | 'sky' | 'gold'
}) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-400/10',
    rose:    'text-rose-400 bg-rose-400/10',
    sky:     'text-sky-400 bg-sky-400/10',
    gold:    'text-gold-400 bg-gold-400/10',
  }

  return (
    <div className="card-glow flex flex-col gap-2">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="font-mono text-xl font-semibold text-slate-100">{formatBRL(value)}</span>
      {trend !== undefined && (
        <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit', colors[color])}>
          {trend >= 0
            ? <ArrowUpRight className="w-3 h-3" />
            : <ArrowDownRight className="w-3 h-3" />
          }
          {Math.abs(trend).toFixed(1)}% vs mês anterior
        </span>
      )}
    </div>
  )
}

function TaskItem({ task }: { task: Task }) {
  const priorityColor = {
    'Urgente': 'bg-rose-400',
    'Alta':    'bg-gold-400',
    'Média':   'bg-sky-400',
    'Baixa':   'bg-slate-500',
  }

  return (
    <Link to={`/tarefas`} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 active:opacity-70 transition-opacity">
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityColor[task.task_priority])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate">{task.task_description}</p>
        {task.task_due_date && (
          <p className="text-xs text-slate-500 mt-0.5">{formatDate(task.task_due_date)}</p>
        )}
      </div>
      <span className={cn(
        'chip text-xs flex-shrink-0',
        task.task_status === 'Em Progresso' ? 'bg-sky-400/10 text-sky-400' : 'bg-base-700 text-slate-400'
      )}>
        {task.task_status}
      </span>
    </Link>
  )
}

// ── Página principal ─────────────────────────────────────────

export default function Dashboard() {
  const { profile } = useAuth()
  const [banks, setBanks] = useState<BankBalance[]>([])
  const [summary, setSummary] = useState<MonthlySummary>({ totalRevenues: 0, totalExpenses: 0, balance: 0 })
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [banksRes, revenuesRes, expensesRes, tasksRes] = await Promise.all([
        supabase.from('vw_bank_balance').select('*'),
        supabase.from('revenues')
          .select('revenue_amount')
          .gte('revenue_datetime', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('transactions')
          .select('transaction_amount')
          .gte('transaction_datetime', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('vw_pending_tasks').select('*').limit(4),
      ])

      if (banksRes.data) setBanks(banksRes.data as BankBalance[])

      const totalRevenues = (revenuesRes.data ?? []).reduce((s, r) => s + r.revenue_amount, 0)
      const totalExpenses = (expensesRes.data ?? []).reduce((s, t) => s + t.transaction_amount, 0)
      setSummary({ totalRevenues, totalExpenses, balance: totalRevenues - totalExpenses })

      if (tasksRes.data) setTasks(tasksRes.data as Task[])
      setLoading(false)
    }
    load()
  }, [])

  const totalBalance = banks.reduce((s, b) => s + b.current_balance, 0)
  const firstName = profile?.user_name.split(' ')[0] ?? 'você'
  const initials = getInitials(profile?.user_name ?? '?')

  return (
    <div className="screen gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">Olá, {firstName} 👋</p>
          <h1 className="font-display text-2xl text-slate-100 mt-0.5">{currentMonthLabel()}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-base-800 border border-white/10 flex items-center justify-center text-slate-400 active:scale-95 transition-transform">
            <Bell className="w-4 h-4" />
          </button>
          <Link to="/configuracoes" className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-semibold text-sm">
            {initials}
          </Link>
        </div>
      </div>

      {/* Saldo total */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2a1a 0%, #0f1a2e 100%)', border: '1px solid rgba(232,175,26,0.15)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,175,26,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <p className="text-slate-400 text-sm">Saldo total consolidado</p>
        <p className={cn('font-mono text-4xl font-bold mt-1', totalBalance >= 0 ? 'text-slate-100' : 'text-rose-400')}>
          {loading ? <span className="skeleton h-10 w-48 block" /> : formatBRL(totalBalance)}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            {formatBRL(summary.totalRevenues)} entrada
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 text-sm">
            <TrendingDown className="w-4 h-4" />
            {formatBRL(summary.totalExpenses)} saída
          </span>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Receitas" value={summary.totalRevenues} color="emerald" />
        <StatCard label="Despesas" value={summary.totalExpenses} color="rose" />
      </div>

      {/* Contas bancárias */}
      {banks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Contas</h2>
            <Link to="/configuracoes" className="text-gold-400 text-xs">Ver todas</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1">
            {banks.map(bank => (
              <div key={bank.bank_id}
                className="flex-shrink-0 w-44 rounded-2xl p-4 border border-white/5"
                style={{ background: `linear-gradient(135deg, ${bank.bank_color}22 0%, ${bank.bank_color}08 100%)`, borderColor: `${bank.bank_color}30` }}>
                <p className="text-xs text-slate-400 truncate">{bank.bank_name}</p>
                <p className={cn('font-mono font-semibold mt-1 text-sm',
                  bank.current_balance >= 0 ? 'text-slate-100' : 'text-rose-400')}>
                  {formatBRL(bank.current_balance)}
                </p>
              </div>
            ))}
            <Link to="/configuracoes"
              className="flex-shrink-0 w-16 h-full min-h-[72px] rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-slate-600 hover:text-slate-400 hover:border-white/20 transition-colors">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Tarefas urgentes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Tarefas urgentes</h2>
          <Link to="/tarefas" className="text-gold-400 text-xs">Ver todas</Link>
        </div>
        <div className="card">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-3 border-b border-white/5 last:border-0">
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ))
            : tasks.length > 0
              ? tasks.map(task => <TaskItem key={task.task_id} task={task} />)
              : (
                <p className="text-slate-500 text-sm text-center py-4">
                  Nenhuma tarefa pendente 🎉
                </p>
              )
          }
        </div>
      </section>

      {/* FAB — Lançamento rápido */}
      <Link
        to="/financas/novo"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform z-40"
        style={{ boxShadow: '0 0 24px rgba(232,175,26,0.4)' }}
      >
        <Plus className="w-6 h-6 text-base-900" />
      </Link>
    </div>
  )
}
