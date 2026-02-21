import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Revenue, Bank } from '@/types/database'

export interface RevenueWithBank extends Revenue {
  bank: Bank
}

export function useRevenues(month: Date) {
  const [revenues, setRevenues] = useState<RevenueWithBank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).toISOString()
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('revenues')
        .select('*, bank:banks(*)')
        .gte('revenue_datetime', startOfMonth)
        .lte('revenue_datetime', endOfMonth)
        .order('revenue_datetime', { ascending: false })

      if (error) throw error
      setRevenues((data as RevenueWithBank[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar receitas')
    } finally {
      setLoading(false)
    }
  }, [startOfMonth, endOfMonth])

  useEffect(() => { fetch() }, [fetch])

  const addRevenue = async (data: {
    bank_id: string
    revenue_amount: number
    revenue_type: Revenue['revenue_type']
    revenue_description?: string
    revenue_datetime?: string
  }) => {
    const { error } = await supabase.from('revenues').insert({
      ...data,
      revenue_datetime: data.revenue_datetime ?? new Date().toISOString(),
      revenue_is_recurring: false,
    })
    if (error) throw new Error(error.message)
    await fetch()
  }

  const deleteRevenue = async (id: string) => {
    const { error } = await supabase.from('revenues').delete().eq('revenue_id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  const total = revenues.reduce((s, r) => s + r.revenue_amount, 0)

  return { revenues, loading, error, total, refetch: fetch, addRevenue, deleteRevenue }
}
