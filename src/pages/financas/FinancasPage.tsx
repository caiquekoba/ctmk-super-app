import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn, formatBRL } from '@/lib/utils'
import MonthPicker from '@/components/ui/MonthPicker'
import TransactionList from '@/components/financas/TransactionList'
import TransactionForm from '@/components/financas/TransactionForm'
import OrcamentoTab from '@/components/financas/OrcamentoTab'
import ReceitasTab from '@/components/financas/ReceitasTab'
import RelatoriosTab from '@/components/financas/RelatoriosTab'
import { useTransactions } from '@/hooks/useTransactions'

type Tab = 'extrato' | 'orcamento' | 'receitas' | 'relatorios'

const TABS: { id: Tab; label: string }[] = [
  { id: 'extrato',    label: 'Extrato'   },
  { id: 'orcamento',  label: 'Orçamento' },
  { id: 'receitas',   label: 'Receitas'  },
  { id: 'relatorios', label: 'Relatórios'},
]

export default function FinancasPage() {
  const [tab, setTab] = useState<Tab>('extrato')
  const [month, setMonth] = useState(new Date())
  const [showForm, setShowForm] = useState(false)

  const { transactions, loading, total, addTransaction, deleteTransaction } = useTransactions({ month })

  return (
    <div className="screen gap-0">

      {/* Header fixo */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl text-slate-100">Finanças</h1>
          <MonthPicker value={month} onChange={setMonth} />
        </div>

        {/* Total do mês no extrato */}
        {tab === 'extrato' && (
          <div className="card-glow flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Despesas do mês</p>
              <p className="font-mono text-2xl font-bold text-rose-400 mt-0.5">
                {loading ? <span className="skeleton h-7 w-28 block" /> : `- ${formatBRL(total)}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Lançamentos</p>
              <p className="font-mono text-xl font-semibold text-slate-300 mt-0.5">
                {loading ? '—' : transactions.length}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-base-800 rounded-2xl p-1 gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-200',
                tab === t.id
                  ? 'bg-gold-500 text-base-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das abas */}
      <div className="flex-1 overflow-y-auto -mx-4 px-4 pb-4">
        <div className="page-enter">
          {tab === 'extrato' && (
            <TransactionList
              transactions={transactions}
              loading={loading}
              onDelete={deleteTransaction}
            />
          )}
          {tab === 'orcamento'  && <OrcamentoTab  month={month} />}
          {tab === 'receitas'   && <ReceitasTab   month={month} />}
          {tab === 'relatorios' && <RelatoriosTab month={month} />}
        </div>
      </div>

      {/* FAB — Nova despesa (apenas na aba extrato) */}
      {tab === 'extrato' && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform z-40"
          style={{ boxShadow: '0 0 24px rgba(232,175,26,0.4)' }}
        >
          <Plus className="w-6 h-6 text-base-900" />
        </button>
      )}

      {/* Form de nova despesa */}
      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={addTransaction}
      />
    </div>
  )
}
