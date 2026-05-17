'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Profile } from '@/types'
import toast from 'react-hot-toast'

const supabase = createClient()

async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Pick<Profile, 'display_name' | 'monthly_income'>>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profil diperbarui!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
