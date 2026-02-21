import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Expense, Bank } from '@/types/database'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('expenses')
      .select('*')
      .eq('expense_is_active', true)
      .order('expense_name')
      .then(({ data }) => {
        setExpenses(data ?? [])
        setLoading(false)
      })
  }, [])

  return { expenses, loading }
}

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('banks')
      .select('*')
      .eq('bank_is_active', true)
      .order('bank_name')
      .then(({ data }) => {
        setBanks(data ?? [])
        setLoading(false)
      })
  }, [])

  return { banks, loading }
}
