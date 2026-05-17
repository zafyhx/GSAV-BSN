'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Budget, BudgetFormData } from '@/types'
import toast from 'react-hot-toast'

const supabase = createClient()

async function fetchBudgets(year: number, month: number): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, category:categories(*)')
    .eq('year', year)
    .eq('month', month)

  if (error) throw error
  return data ?? []
}

export function useBudgets(year?: number, month?: number) {
  const now = new Date()
  const y = year ?? now.getFullYear()
  const m = month ?? now.getMonth() + 1

  return useQuery({
    queryKey: ['budgets', y, m],
    queryFn: () => fetchBudgets(y, m),
  })
}

export function useUpsertBudget() {
  const qc = useQueryClient()
  const now = new Date()

  return useMutation({
    mutationFn: async (data: BudgetFormData & { month?: number; year?: number }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const month = data.month ?? now.getMonth() + 1
      const year = data.year ?? now.getFullYear()

      const { error } = await supabase.from('budgets').upsert({
        user_id: user.id,
        category_id: data.category_id,
        amount: parseFloat(data.amount),
        month,
        year,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,category_id,month,year' })

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget disimpan!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
