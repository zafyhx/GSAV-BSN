'use client'

import { useTransactionsByMonth } from '@/lib/hooks/useTransactions'
import { generateInsights, calculateFinancialSummary } from '@/lib/utils/insights-engine'
import { useBudgets } from '@/lib/hooks/useBudget'
import { useCategories } from '@/lib/hooks/useCategories'
import { useProfile } from '@/lib/hooks/useProfile'
import { cn } from '@/lib/utils/cn'
import { Lightbulb } from 'lucide-react'
import { useState, useEffect } from 'react'

const typeStyles = {
  danger: 'border-accent-red/30 bg-accent-red/10 text-accent-red',
  warning: 'border-accent-amber/30 bg-accent-amber/10 text-accent-amber',
  info: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
  tip: 'border-accent-green/30 bg-accent-green/10 text-accent-green',
}

export function InsightBanner() {
  const now = new Date()
  const { data: transactions = [] } = useTransactionsByMonth(now.getFullYear(), now.getMonth() + 1)
  const { data: budgets = [] } = useBudgets()
  const { data: categories = [] } = useCategories()
  const { data: profile } = useProfile()

  const summary = calculateFinancialSummary(transactions, profile?.monthly_income ?? 0)

  // Compute budgets with spent %
  const enrichedBudgets = budgets.map(b => {
    const spent = transactions
      .filter(t => t.category_id === b.category_id && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0
    return { ...b, spent, percentage }
  })

  const insights = generateInsights({
    transactions,
    budgets: enrichedBudgets,
    categories,
    summary,
  })

  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (insights.length <= 1) return
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % insights.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [insights.length])

  if (!insights.length) return null

  const active = insights[activeIdx]

  return (
    <div className={cn(
      'rounded-2xl border p-4 transition-all duration-300',
      typeStyles[active.type]
    )}>
      <div className="flex items-start gap-3">
        <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm leading-relaxed font-medium">{active.message}</p>
      </div>
      {insights.length > 1 && (
        <div className="flex gap-1 mt-3">
          {insights.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === activeIdx ? 'w-6 bg-current opacity-80' : 'w-2 bg-current opacity-30'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
