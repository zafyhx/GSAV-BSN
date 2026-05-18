'use client'

import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useCategories } from '@/lib/hooks/useCategories'
import { useAddTransaction, useUpdateTransaction } from '@/lib/hooks/useTransactions'
import { Transaction, TransactionType, TransactionFormData } from '@/types'
import { cn } from '@/lib/utils/cn'
import { parseAmountString, formatCurrency } from '@/lib/utils/currency'
import { toLocalDateTimeString } from '@/lib/utils/date'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction // if provided, we're editing
}

export function TransactionModal({ open, onClose, transaction }: TransactionModalProps) {
  const { data: categories = [] } = useCategories()
  const { mutate: addTransaction, isPending: isAdding } = useAddTransaction()
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction()
  const isPending = isAdding || isUpdating

  const isEditing = !!transaction

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => toLocalDateTimeString())

  // Pre-fill when editing
  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setCategoryId(transaction.category_id ?? '')
      setNote(transaction.note ?? '')
      setDate(toLocalDateTimeString(new Date(transaction.transaction_date)))
    } else {
      setType('expense')
      setAmount('')
      setCategoryId('')
      setNote('')
      setDate(toLocalDateTimeString())
    }
  }, [transaction, open])

  const parsedAmount = parseAmountString(amount)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!parsedAmount) return

    const data = {
      amount: parsedAmount.toString(),
      category_id: categoryId || null,
      type,
      note,
      transaction_date: new Date(date).toISOString(),
    }

    if (isEditing) {
      updateTransaction({ id: transaction.id, data })
    } else {
      addTransaction(data)
    }

    onClose()
  }

  const filteredCategories = categories

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-bg-surface rounded-2xl">
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                type === t
                  ? t === 'expense'
                    ? 'bg-accent-red text-white shadow-md'
                    : 'bg-accent-green text-bg-primary shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {t === 'expense'
                ? <><TrendingDown className="w-4 h-4" /> Pengeluaran</>
                : <><TrendingUp className="w-4 h-4" /> Pemasukan</>}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-text-secondary font-medium mb-2 block">
            Jumlah (IDR)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">Rp</span>
            <input
              id="transaction-amount"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              required
              className="w-full pl-10 pr-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary text-lg font-semibold mono-number focus:border-accent-green/50 transition-all"
            />
          </div>
          {parsedAmount && (
            <p className="text-xs text-text-muted mt-1.5 ml-1">
              = {formatCurrency(parsedAmount)}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-text-secondary font-medium mb-2 block">
            Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all',
                  categoryId === cat.id
                    ? 'text-bg-primary font-semibold shadow-md'
                    : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-border'
                )}
                style={categoryId === cat.id ? { backgroundColor: cat.color } : {}}
              >
                <DynamicIcon name={cat.icon} className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs text-text-secondary font-medium mb-2 block">
            Catatan (opsional)
          </label>
          <input
            id="transaction-note"
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Starbucks, bensin, dll."
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-2xl text-text-primary text-sm placeholder:text-text-muted focus:border-accent-green/50 transition-all"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs text-text-secondary font-medium mb-2 block">
            Tanggal & Waktu
          </label>
          <input
            id="transaction-date"
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-bg-surface border border-border rounded-2xl text-text-primary text-sm focus:border-accent-green/50 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={!parsedAmount || isPending}
          className="w-full py-4 bg-accent-green text-bg-primary font-semibold rounded-2xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Transaksi'}
        </button>
      </form>
    </BottomSheet>
  )
}
