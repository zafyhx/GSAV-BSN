'use client'

import { useState } from 'react'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { TransactionList } from '@/components/transactions/TransactionList'
import { QuickAddBar } from '@/components/transactions/QuickAddBar'
import { Transaction } from '@/types'

type Filter = 'all' | 'expense' | 'income'

export default function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered: Transaction[] = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        t.note?.toLowerCase().includes(q) ||
        t.category?.name.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      )
    })

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'income', label: 'Pemasukan' },
  ]

  return (
    <div className="space-y-4 pt-2 pb-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-text-primary">Transaksi</h1>
        <p className="text-xs text-text-muted mt-0.5">{transactions.length} total transaksi</p>
      </div>

      {/* Quick Add */}
      <QuickAddBar />

      {/* Search */}
      <input
        id="transaction-search"
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Cari transaksi..."
        className="w-full px-4 py-3 bg-bg-card border border-border rounded-2xl text-text-primary text-sm placeholder:text-text-muted focus:border-accent-green/50 transition-all"
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f.value
                ? 'bg-accent-green text-bg-primary'
                : 'bg-bg-card border border-border text-text-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : (
        <TransactionList transactions={filtered} />
      )}
    </div>
  )
}
