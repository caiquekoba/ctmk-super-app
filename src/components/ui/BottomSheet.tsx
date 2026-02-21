import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  height?: 'auto' | 'full' | 'half'
}

export default function BottomSheet({ open, onClose, title, children, height = 'auto' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Fecha ao pressionar Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Previne scroll do body quando aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const heightClass = {
    auto: 'max-h-[90vh]',
    full: 'h-[90vh]',
    half: 'h-[50vh]',
  }[height]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'relative bg-base-800 rounded-t-3xl border-t border-white/10',
          'animate-slide-up overflow-hidden flex flex-col',
          heightClass
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-white/5">
            <h2 className="font-display text-lg text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-base-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
