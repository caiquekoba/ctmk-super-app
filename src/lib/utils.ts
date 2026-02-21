import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Tailwind className merge ─────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Formatadores de moeda ────────────────────────────────────
const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const BRL_COMPACT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const PCT = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
})

export const formatBRL = (value: number) => BRL.format(value)
export const formatBRLCompact = (value: number) => BRL_COMPACT.format(value)
export const formatPct = (value: number) => PCT.format(value / 100)

/** Formata valor com sinal e cor */
export function formatGainLoss(value: number): { text: string; color: string } {
  const text = formatBRL(Math.abs(value))
  return {
    text: value >= 0 ? `+${text}` : `-${text}`,
    color: value >= 0 ? 'text-emerald-400' : 'text-rose-400',
  }
}

// ── Formatadores de data ─────────────────────────────────────
export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return format(date, "d 'de' MMM", { locale: ptBR })
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDateTime(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return format(date, "'Hoje,' HH:mm")
  return format(date, "d MMM, HH:mm", { locale: ptBR })
}

export function currentMonthLabel(): string {
  return format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })
}

// ── Outros utilitários ───────────────────────────────────────
/** Capitaliza primeira letra */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Trunca texto com ellipsis */
export const truncate = (s: string, max: number) =>
  s.length > max ? `${s.slice(0, max)}...` : s

/** Gera cor HSL estável a partir de string */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${hash % 360}, 60%, 60%)`
}

/** Iniciais do nome (ex: "João Silva" → "JS") */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}
