'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TransactionModal } from '@/components/transactions/TransactionModal'
import { cn } from '@/lib/utils/cn'

export function FAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        id="fab-add-transaction"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed z-40 w-14 h-14 rounded-full',
          'bg-accent-green text-bg-primary shadow-xl shadow-accent-green/30',
          'flex items-center justify-center',
          'transition-all duration-200 active:scale-90',
          'bottom-[calc(var(--nav-height)+max(env(safe-area-inset-bottom),8px)+12px)]',
          'right-5'
        )}
        aria-label="Tambah transaksi"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>
      <TransactionModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
