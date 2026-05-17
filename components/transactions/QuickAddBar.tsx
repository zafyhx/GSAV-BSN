'use client'

import { useState, useRef } from 'react'
import { parseQuickInput } from '@/lib/utils/quick-parser'
import { useCategories } from '@/lib/hooks/useCategories'
import { useAddTransaction } from '@/lib/hooks/useTransactions'
import { formatCurrencyCompact } from '@/lib/utils/currency'
import { Send, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { DynamicIcon } from '@/components/ui/DynamicIcon'

export function QuickAddBar() {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: categories = [] } = useCategories()
  const { mutate: addTransaction, isPending } = useAddTransaction()

  const parsed = input.trim() ? parseQuickInput(input, categories) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!parsed?.is_valid || isPending) return

    addTransaction({
      amount: parsed.amount.toString(),
      category_id: parsed.matched_category?.id ?? null,
      type: parsed.type,
      note: parsed.note ?? '',
      transaction_date: new Date().toISOString(),
    })

    setInput('')
    inputRef.current?.focus()

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(10)
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-3.5 h-3.5 text-accent-amber" />
        <span className="text-xs text-text-muted font-medium">Quick Add</span>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          ref={inputRef}
          id="quick-add-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='contoh: "makan 15000" atau "gaji 500000"'
          className="flex-1 text-sm text-text-primary placeholder:text-text-muted bg-transparent outline-none"
          autoComplete="off"
          autoCorrect="off"
        />
        <button
          type="submit"
          disabled={!parsed?.is_valid || isPending}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90',
            parsed?.is_valid
              ? 'bg-accent-green text-bg-primary shadow-lg shadow-accent-green/20'
              : 'bg-bg-elevated text-text-muted'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Preview */}
      {parsed && input.trim() && (
        <div className={cn(
          'mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs',
          parsed.is_valid ? 'text-text-secondary' : 'text-accent-red'
        )}>
          {parsed.is_valid ? (
            <>
              <DynamicIcon name={parsed.matched_category?.icon ?? 'Package'} className="w-3.5 h-3.5" style={{ color: parsed.matched_category?.color }} />
              <span className="font-medium">{parsed.matched_category?.name ?? parsed.category_name}</span>
              <span>·</span>
              <span className={parsed.type === 'income' ? 'text-accent-green font-semibold' : 'text-text-primary font-semibold'}>
                {parsed.type === 'income' ? '+' : '-'}{formatCurrencyCompact(parsed.amount)}
              </span>
              {parsed.note && (
                <>
                  <span>·</span>
                  <span className="text-text-muted truncate">{parsed.note}</span>
                </>
              )}
            </>
          ) : (
            <span>{parsed.error}</span>
          )}
        </div>
      )}
    </div>
  )
}
