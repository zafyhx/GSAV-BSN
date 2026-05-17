'use client'

import { useState } from 'react'
import { useBudgets, useUpsertBudget, useDeleteBudget } from '@/lib/hooks/useBudget'
import { useCategories } from '@/lib/hooks/useCategories'
import { useTransactionsByMonth } from '@/lib/hooks/useTransactions'
import { formatCurrencyCompact } from '@/lib/utils/currency'
import { MONTH_NAMES } from '@/lib/constants/categories'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { Plus, Trash2, Wallet } from 'lucide-react'
import { parseAmountString } from '@/lib/utils/currency'
import { Category } from '@/types'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const now = new Date()
  const { data: budgets = [], isLoading } = useBudgets()
  const { data: categories = [] } = useCategories()
  const { data: transactions = [] } = useTransactionsByMonth(now.getFullYear(), now.getMonth() + 1)
  const { mutate: upsertBudget, isPending } = useUpsertBudget()
  const { mutate: deleteBudget } = useDeleteBudget()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [amount, setAmount] = useState('')

  // Compute spent per category
  const enriched = budgets.map(b => {
    const spent = transactions
      .filter(t => t.category_id === b.category_id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0
    return { ...b, spent, percentage, remaining: b.amount - spent }
  })

  const totalBudget = enriched.reduce((s, b) => s + b.amount, 0)
  const totalSpent = enriched.reduce((s, b) => s + b.spent, 0)
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Categories without budget
  const budgetedIds = new Set(budgets.map(b => b.category_id))
  const unbudgeted = categories.filter(c => !budgetedIds.has(c.id))

  function openAddBudget(cat?: Category) {
    setSelectedCategory(cat ?? null)
    setAmount('')
    setSheetOpen(true)
  }

  function handleSave() {
    if (!selectedCategory) { toast.error('Pilih kategori dulu'); return }
    const parsed = parseAmountString(amount)
    if (!parsed) { toast.error('Jumlah tidak valid'); return }

    upsertBudget({ category_id: selectedCategory.id, amount: parsed.toString() })
    setSheetOpen(false)
  }

  return (
    <div className="space-y-4 pt-2 pb-4">
      <div id="tour-budget-list" className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Budget</h1>
          <p className="text-xs text-text-muted mt-0.5">{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</p>
        </div>
        <button
          onClick={() => openAddBudget()}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent-green/15 text-accent-green rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {/* Total */}
      {enriched.length > 0 && (
        <Card className="bg-gradient-to-br from-bg-elevated to-bg-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted font-medium">Total Budget Terpakai</p>
            <p className="text-xs font-semibold" style={{ color: totalPct > 80 ? '#f87171' : '#22c55e' }}>
              {Math.round(totalPct)}%
            </p>
          </div>
          <ProgressBar value={totalPct} color={totalPct > 80 ? '#f87171' : '#22c55e'} />
          <div className="flex justify-between mt-2.5 text-xs text-text-muted">
            <span>{formatCurrencyCompact(totalSpent)} terpakai</span>
            <span>{formatCurrencyCompact(totalBudget)} total</span>
          </div>
        </Card>
      )}

      {/* Budget cards */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : enriched.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Belum ada budget"
          description="Tetapkan budget per kategori untuk kontrol pengeluaranmu"
          action={
            <button onClick={() => openAddBudget()} className="px-5 py-2.5 bg-accent-green text-bg-primary rounded-xl text-sm font-medium">
              Buat Budget Pertama
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {enriched.map(b => {
            const isOver = b.percentage > 100
            const color = isOver ? '#f87171' : b.percentage > 80 ? '#fbbf24' : b.category?.color ?? '#22c55e'
            return (
              <Card key={b.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${b.category?.color ?? '#64748b'}22`, color: b.category?.color ?? '#64748b' }}
                    >
                      <DynamicIcon name={b.category?.icon ?? 'Package'} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{b.category?.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatCurrencyCompact(b.spent)} / {formatCurrencyCompact(b.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${isOver ? 'text-accent-red' : 'text-text-primary'}`}>
                      {isOver ? '-' : ''}{formatCurrencyCompact(Math.abs(b.remaining))}
                    </p>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="w-7 h-7 rounded-lg bg-accent-red/10 flex items-center justify-center text-accent-red"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <ProgressBar value={b.percentage} color={color} />
                {isOver && (
                  <p className="text-xs text-accent-red mt-1.5">
                    Over budget {formatCurrencyCompact(Math.abs(b.remaining))}!
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Budget Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Set Budget">
        <div className="space-y-5 pt-2">
          {/* Category selector */}
          <div>
            <label className="text-xs text-text-secondary font-medium mb-2 block">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all ${
                    selectedCategory?.id === cat.id
                      ? 'text-bg-primary font-semibold'
                      : 'bg-bg-surface border border-border text-text-secondary'
                  }`}
                  style={selectedCategory?.id === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <DynamicIcon name={cat.icon} className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-text-secondary font-medium mb-2 block">Limit Budget (IDR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">Rp</span>
              <input
                id="budget-amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="300000"
                className="w-full pl-10 pr-4 py-3.5 bg-bg-surface border border-border rounded-2xl text-text-primary text-lg font-semibold mono-number focus:border-accent-green/50 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-4 bg-accent-green text-bg-primary font-semibold rounded-2xl active:scale-95 transition-all disabled:opacity-40"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Budget'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
