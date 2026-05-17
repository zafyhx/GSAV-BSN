'use client'

import { Transaction } from '@/types'
import { formatCurrencyCompact } from '@/lib/utils/currency'
import { formatRelative } from '@/lib/utils/date'
import { useDeleteTransaction } from '@/lib/hooks/useTransactions'
import { useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TransactionModal } from './TransactionModal'
import { DynamicIcon } from '@/components/ui/DynamicIcon'

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { mutate: deleteTransaction, isPending } = useDeleteTransaction()

  const isExpense = transaction.type === 'expense'
  const category = transaction.category

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 py-3.5 px-1',
          'border-b border-border-subtle last:border-0',
          'tap-highlight'
        )}
        onClick={() => setShowActions(s => !s)}
      >
        {/* Category Icon */}
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${category?.color ?? '#64748b'}22`, color: category?.color ?? '#64748b' }}
        >
          <DynamicIcon name={category?.icon ?? 'Package'} className="w-5 h-5" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {transaction.note || category?.name || 'Transaksi'}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {category?.name} · {formatRelative(transaction.transaction_date)}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className={cn(
            'text-base font-semibold mono-number',
            isExpense ? 'text-text-primary' : 'text-accent-green'
          )}>
            {isExpense ? '-' : '+'}{formatCurrencyCompact(transaction.amount)}
          </p>
        </div>
      </div>

      {/* Inline actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 py-2 px-1 float-up">
          <button
            onClick={() => { setShowEdit(true); setShowActions(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-blue/10 text-accent-blue text-xs font-medium"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => { deleteTransaction(transaction.id); setShowActions(false) }}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-red/10 text-accent-red text-xs font-medium disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            Hapus
          </button>
          <button
            onClick={() => setShowActions(false)}
            className="px-3 py-1.5 rounded-xl bg-bg-elevated text-text-secondary text-xs font-medium"
          >
            Batal
          </button>
        </div>
      )}

      <TransactionModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        transaction={transaction}
      />
    </>
  )
}
