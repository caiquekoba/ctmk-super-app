import { format, addMonths, subMonths, isAfter, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthPickerProps {
  value: Date
  onChange: (date: Date) => void
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const isCurrentMonth = !isAfter(startOfMonth(addMonths(value, 1)), startOfMonth(new Date()))

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(subMonths(value, 1))}
        className="w-8 h-8 rounded-full bg-base-700 flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-90 transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-slate-200 font-medium text-sm min-w-[120px] text-center capitalize">
        {format(value, 'MMMM yyyy', { locale: ptBR })}
      </span>

      <button
        onClick={() => onChange(addMonths(value, 1))}
        disabled={isCurrentMonth}
        className="w-8 h-8 rounded-full bg-base-700 flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
