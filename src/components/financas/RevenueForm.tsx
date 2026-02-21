import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import BottomSheet from '@/components/ui/BottomSheet'
import { useBanks } from '@/hooks/useExpensesAndBanks'
import type { Revenue } from '@/types/database'

const REVENUE_TYPES: Revenue['revenue_type'][] = [
  'Salário', 'Pró-labore', 'Dividendo PJ', 'Freelance', 'Aluguel', 'Investimento', 'Outro'
]

interface RevenueFormData {
  revenue_amount: string
  bank_id: string
  revenue_type: Revenue['revenue_type']
  revenue_description: string
  revenue_datetime: string
}

interface RevenueFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    bank_id: string
    revenue_amount: number
    revenue_type: Revenue['revenue_type']
    revenue_description?: string
    revenue_datetime?: string
  }) => Promise<void>
}

export default function RevenueForm({ open, onClose, onSave }: RevenueFormProps) {
  const { banks } = useBanks()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RevenueFormData>({
    defaultValues: {
      revenue_type: 'Salário',
      revenue_datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    }
  })

  async function onSubmit(data: RevenueFormData) {
    setError(null)
    setSaving(true)
    try {
      await onSave({
        bank_id: data.bank_id,
        revenue_amount: parseFloat(data.revenue_amount.replace(',', '.')),
        revenue_type: data.revenue_type,
        revenue_description: data.revenue_description || undefined,
        revenue_datetime: new Date(data.revenue_datetime).toISOString(),
      })
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    reset()
    setError(null)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Nova Receita">
      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 flex flex-col gap-4">

        {/* Valor */}
        <div className="bg-base-900 rounded-2xl p-5 text-center">
          <label className="label text-center mb-2">Valor recebido</label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-500 text-2xl font-light">R$</span>
            <input
              {...register('revenue_amount', { required: 'Informe o valor' })}
              type="decimal"
              inputMode="decimal"
              placeholder="0,00"
              className="bg-transparent text-4xl font-mono font-bold text-emerald-400 text-center w-40 focus:outline-none placeholder-slate-700"
            />
          </div>
          {errors.revenue_amount && <p className="text-rose-400 text-xs mt-2">{errors.revenue_amount.message}</p>}
        </div>

        {/* Tipo de receita */}
        <div>
          <label className="label">Tipo de receita</label>
          <div className="grid grid-cols-2 gap-2">
            {REVENUE_TYPES.map(type => (
              <label key={type} className="flex items-center gap-2 p-3 rounded-xl border border-white/10 cursor-pointer hover:border-emerald-500/30 transition-colors">
                <input type="radio" {...register('revenue_type', { required: true })} value={type} className="accent-emerald-500" />
                <span className="text-sm text-slate-300">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conta destino */}
        <div>
          <label className="label">Conta destino</label>
          <select {...register('bank_id', { required: 'Selecione uma conta' })} className="input">
            <option value="">Selecione...</option>
            {banks.map(b => <option key={b.bank_id} value={b.bank_id}>{b.bank_name}</option>)}
          </select>
          {errors.bank_id && <p className="text-rose-400 text-xs mt-1">{errors.bank_id.message}</p>}
        </div>

        {/* Descrição */}
        <div>
          <label className="label">Descrição (opcional)</label>
          <input {...register('revenue_description')} type="text" placeholder="Ex: Salário março" className="input" />
        </div>

        {/* Data */}
        <div>
          <label className="label">Data</label>
          <input {...register('revenue_datetime')} type="datetime-local" className="input" />
        </div>

        {error && (
          <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pb-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            {saving
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Salvar receita'
            }
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
