import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import BottomSheet from '@/components/ui/BottomSheet'
import { useExpenses, useBanks } from '@/hooks/useExpensesAndBanks'
import { cn } from '@/lib/utils'

interface TransactionFormData {
  transaction_amount: string
  expense_id: string
  bank_id: string
  transaction_description: string
  transaction_datetime: string
  transaction_installments: string
}

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    expense_id: string
    bank_id: string
    transaction_amount: number
    transaction_description?: string
    transaction_datetime?: string
    transaction_installments?: number
  }) => Promise<void>
}

export default function TransactionForm({ open, onClose, onSave }: TransactionFormProps) {
  const { expenses } = useExpenses()
  const { banks } = useBanks()
  const [saving, setSaving] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      transaction_datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      transaction_installments: '1',
    }
  })

  const amount = watch('transaction_amount')

  async function onSubmit(data: TransactionFormData) {
    setError(null)
    setSaving(true)
    try {
      await onSave({
        expense_id: data.expense_id,
        bank_id: data.bank_id,
        transaction_amount: parseFloat(data.transaction_amount.replace(',', '.')),
        transaction_description: data.transaction_description || undefined,
        transaction_datetime: data.transaction_datetime
          ? new Date(data.transaction_datetime).toISOString()
          : undefined,
        transaction_installments: parseInt(data.transaction_installments) || 1,
      })
      reset()
      setShowMore(false)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    reset()
    setShowMore(false)
    setError(null)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Nova Despesa" height="auto">
      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 flex flex-col gap-4">

        {/* Valor — destaque visual */}
        <div className="bg-base-900 rounded-2xl p-5 text-center">
          <label className="label text-center mb-2">Valor</label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-500 text-2xl font-light">R$</span>
            <input
              {...register('transaction_amount', {
                required: 'Informe o valor',
                pattern: { value: /^\d+([.,]\d{0,2})?$/, message: 'Valor inválido' }
              })}
              type="decimal"
              inputMode="decimal"
              placeholder="0,00"
              className="bg-transparent text-4xl font-mono font-bold text-slate-100 text-center w-40 focus:outline-none placeholder-slate-700"
            />
          </div>
          {errors.transaction_amount && (
            <p className="text-rose-400 text-xs mt-2">{errors.transaction_amount.message}</p>
          )}
        </div>

        {/* Categoria */}
        <div>
          <label className="label">Categoria</label>
          <select
            {...register('expense_id', { required: 'Selecione uma categoria' })}
            className="input"
          >
            <option value="">Selecione...</option>
            {expenses.map(e => (
              <option key={e.expense_id} value={e.expense_id}>
                {e.expense_icon} {e.expense_name}
              </option>
            ))}
          </select>
          {errors.expense_id && <p className="text-rose-400 text-xs mt-1">{errors.expense_id.message}</p>}
        </div>

        {/* Conta */}
        <div>
          <label className="label">Conta / Cartão</label>
          <div className="grid grid-cols-2 gap-2">
            {banks.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-2 py-2">Nenhuma conta cadastrada</p>
            ) : banks.map(bank => {
              const field = register('bank_id', { required: 'Selecione uma conta' })
              return (
                <label
                  key={bank.bank_id}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all',
                    'border-white/10 hover:border-white/20'
                  )}
                >
                  <input type="radio" {...field} value={bank.bank_id} className="sr-only" />
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bank.bank_color }} />
                  <span className="text-sm text-slate-300 truncate">{bank.bank_name}</span>
                </label>
              )
            })}
          </div>
          {errors.bank_id && <p className="text-rose-400 text-xs mt-1">{errors.bank_id.message}</p>}
        </div>

        {/* Descrição */}
        <div>
          <label className="label">Descrição (opcional)</label>
          <input
            {...register('transaction_description')}
            type="text"
            placeholder="Ex: Supermercado Pão de Açúcar"
            className="input"
          />
        </div>

        {/* Toggle campos avançados */}
        <button
          type="button"
          onClick={() => setShowMore(v => !v)}
          className="text-gold-400 text-sm text-left hover:text-gold-300 transition-colors"
        >
          {showMore ? '▲ Menos detalhes' : '▼ Mais detalhes (data, parcelas)'}
        </button>

        {/* Campos avançados */}
        {showMore && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <label className="label">Data e hora</label>
              <input
                {...register('transaction_datetime')}
                type="datetime-local"
                className="input"
              />
            </div>
            <div>
              <label className="label">Número de parcelas</label>
              <select {...register('transaction_installments')} className="input">
                {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}x {n > 1 ? '(parcelado)' : '(à vista)'}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Resumo do valor */}
        {amount && parseFloat(amount.replace(',', '.')) > 0 && (
          <div className="flex items-center justify-between py-3 border-t border-white/5">
            <span className="text-slate-400 text-sm">Total a lançar</span>
            <span className="font-mono font-bold text-rose-400 text-lg">
              - R$ {parseFloat(amount.replace(',', '.')).toFixed(2).replace('.', ',')}
            </span>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pb-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center">
            {saving
              ? <span className="w-5 h-5 border-2 border-base-900/30 border-t-base-900 rounded-full animate-spin" />
              : 'Salvar'
            }
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
