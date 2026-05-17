'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Transaction, TransactionFormData } from '@/types'
import toast from 'react-hot-toast'

const supabase = createClient()

async function fetchTransactions(limit = 100): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .order('transaction_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

async function fetchTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function useTransactions(limit = 100) {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: () => fetchTransactions(limit),
  })
}

export function useTransactionsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['transactions', year, month],
    queryFn: () => fetchTransactionsByMonth(year, month),
  })
}

export function useAddTransaction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<TransactionFormData, 'category_id'> & { category_id: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: parseFloat(data.amount),
        category_id: data.category_id,
        type: data.type,
        note: data.note || null,
        transaction_date: data.transaction_date,
      })

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi ditambahkan!')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: {
      id: string
      data: Partial<Omit<TransactionFormData, 'category_id'>> & { category_id?: string | null }
    }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: data.amount ? parseFloat(data.amount) : undefined,
          category_id: data.category_id,
          type: data.type,
          note: data.note || null,
          transaction_date: data.transaction_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi diperbarui!')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaksi dihapus')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
