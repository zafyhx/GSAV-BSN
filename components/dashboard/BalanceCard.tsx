'use client'

import { useTransactionsByMonth } from '@/lib/hooks/useTransactions'
import { useProfile } from '@/lib/hooks/useProfile'
import { calculateFinancialSummary } from '@/lib/utils/insights-engine'
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/currency'
import { getDaysLeftInMonth } from '@/lib/utils/date'
import { MONTH_NAMES } from '@/lib/constants/categories'
import { TrendingDown, TrendingUp, Flame, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function BalanceCard() {
  const now = new Date()
  const { data: transactions = [] } = useTransactionsByMonth(now.getFullYear(), now.getMonth() + 1)
  const { data: profile } = useProfile()

  const summary = calculateFinancialSummary(transactions, profile?.monthly_income ?? 0)
  const daysLeft = getDaysLeftInMonth()
  const monthName = MONTH_NAMES[now.getMonth()]

  const isNegative = summary.balance < 0

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-bg-elevated to-bg-card">
      {/* Background glow */}
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2 ${isNegative ? 'bg-accent-red' : 'bg-accent-green'}`} />

      <div className="relative">
        {/* Month label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-text-muted font-medium uppercase tracking-widest">
            {monthName} {now.getFullYear()}
          </span>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Calendar className="w-3 h-3" />
            <span>{daysLeft} hari lagi</span>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-5">
          <p className="text-xs text-text-secondary mb-1">Saldo Bulan Ini</p>
          <p className={`text-4xl font-bold tracking-tight mono-number ${isNegative ? 'text-accent-red' : 'text-text-primary'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>

        {/* Income / Expense */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent-green/10 rounded-xl p-3 border border-accent-green/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
              <span className="text-xs text-accent-green font-medium">Pemasukan</span>
            </div>
            <p className="text-base font-bold text-accent-green mono-number">
              {formatCurrencyCompact(summary.income_this_month)}
            </p>
          </div>

          <div className="bg-accent-red/10 rounded-xl p-3 border border-accent-red/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-accent-red" />
              <span className="text-xs text-accent-red font-medium">Pengeluaran</span>
            </div>
            <p className="text-base font-bold text-accent-red mono-number">
              {formatCurrencyCompact(summary.expense_this_month)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function BurnRateWidget() {
  const now = new Date()
  const { data: transactions = [] } = useTransactionsByMonth(now.getFullYear(), now.getMonth() + 1)
  const { data: profile } = useProfile()
  const summary = calculateFinancialSummary(transactions, profile?.monthly_income ?? 0)

  const hasBurnRate = summary.daily_burn_rate > 0

  return (
    <Card className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-accent-amber/15 flex items-center justify-center flex-shrink-0">
        <Flame className="w-5 h-5 text-accent-amber" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-text-secondary mb-0.5">Burn Rate Harian</p>
        <p className="text-lg font-bold text-text-primary mono-number">
          {hasBurnRate ? formatCurrencyCompact(summary.daily_burn_rate) : '—'}
          <span className="text-xs text-text-muted font-normal ml-1">/hari</span>
        </p>
      </div>
      {summary.days_remaining !== null && summary.days_remaining >= 0 && (
        <div className="text-right">
          <p className="text-xs text-text-muted">Estimasi habis</p>
          <p className={`text-sm font-semibold ${summary.days_remaining <= 7 ? 'text-accent-red' : 'text-text-primary'}`}>
            {summary.days_remaining} hari
          </p>
        </div>
      )}
    </Card>
  )
}
