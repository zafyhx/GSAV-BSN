'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#1a1a1a',
            color: '#f0f0f0',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#080808' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#080808' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
