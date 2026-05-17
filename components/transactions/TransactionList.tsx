'use client'

import { Transaction } from '@/types'
import { groupByDate } from '@/lib/utils/date'
import { TransactionItem } from './TransactionItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArrowLeftRight } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  limit?: number
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  if (!transactions.length) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="Belum ada transaksi"
        description="Tap tombol + untuk mulai mencatat pengeluaran atau pemasukan"
      />
    )
  }

  const displayed = limit ? transactions.slice(0, limit) : transactions
  const grouped = groupByDate(displayed)

  return (
    <div className="space-y-4">
      {grouped.map(group => (
        <div key={group.date}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              {group.label}
            </h3>
            <span className="text-xs text-text-muted">
              {group.items.length} item
            </span>
          </div>
          <div className="bg-bg-card rounded-2xl border border-border px-3">
            {group.items.map(t => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
