'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Category } from '@/types'
import toast from 'react-hot-toast'

const supabase = createClient()

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 min — categories rarely change
  })
}

export function useAddCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; icon: string; color: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('categories').insert({
        user_id: user.id,
        ...data,
        is_default: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori ditambahkan!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
