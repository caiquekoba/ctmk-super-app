import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Transaction, Expense, Bank } from '@/types/database'

export interface TransactionWithRels extends Transaction {
  expense: Expense
  bank: Bank
}

export interface TransactionFilters {
  month: Date
  expense_id?: string
  bank_id?: string
}

export function useTransactions(filters: TransactionFilters) {
  const [transactions, setTransactions] = useState<TransactionWithRels[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startOfMonth = new Date(filters.month.getFullYear(), filters.month.getMonth(), 1).toISOString()
  const endOfMonth = new Date(filters.month.getFullYear(), filters.month.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('transactions')
        .select('*, expense:expenses(*), bank:banks(*)')
        .gte('transaction_datetime', startOfMonth)
        .lte('transaction_datetime', endOfMonth)
        .order('transaction_datetime', { ascending: false })

      if (filters.expense_id) query = query.eq('expense_id', filters.expense_id)
      if (filters.bank_id) query = query.eq('bank_id', filters.bank_id)

      const { data, error } = await query
      if (error) throw error
      setTransactions((data as TransactionWithRels[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }, [startOfMonth, endOfMonth, filters.expense_id, filters.bank_id])

  useEffect(() => { fetch() }, [fetch])

  const addTransaction = async (data: {
    expense_id: string
    bank_id: string
    transaction_amount: number
    transaction_description?: string
    transaction_datetime?: string
    transaction_installments?: number
    investment_product_id?: string
  }) => {
    const { error } = await supabase.from('transactions').insert({
      ...data,
      transaction_datetime: data.transaction_datetime ?? new Date().toISOString(),
      transaction_installments: data.transaction_installments ?? 1,
      transaction_installment_current: 1,
      transaction_is_recurring: false,
    })
    if (error) throw new Error(error.message)
    await fetch()
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('transaction_id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const { error } = await supabase.from('transactions').update(data).eq('transaction_id', id)
    if (error) throw new Error(error.message)
    await fetch()
  }

  const total = transactions.reduce((s, t) => s + t.transaction_amount, 0)

  return { transactions, loading, error, total, refetch: fetch, addTransaction, deleteTransaction, updateTransaction }
}
