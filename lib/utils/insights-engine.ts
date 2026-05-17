import { Transaction, Budget, Category, Insight, FinancialSummary } from '@/types'
import { getDaysLeftInMonth, getDayOfMonth } from '@/lib/utils/date'

export interface FinancialSnapshot {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  summary: FinancialSummary
}

interface InsightRule {
  id: string
  check: (data: FinancialSnapshot) => boolean
  message: (data: FinancialSnapshot) => string
  type: Insight['type']
}

const rules: InsightRule[] = [
  // 1. Saldo akan habis kurang dari 7 hari
  {
    id: 'low-balance-critical',
    check: ({ summary }) =>
      summary.days_remaining !== null && summary.days_remaining <= 3 && summary.balance > 0,
    message: ({ summary }) =>
      `⚠️ Dengan pola sekarang, saldo kamu diperkirakan habis dalam ${summary.days_remaining} hari.`,
    type: 'danger',
  },
  // 2. Saldo akan habis 4-7 hari
  {
    id: 'low-balance-warning',
    check: ({ summary }) =>
      summary.days_remaining !== null &&
      summary.days_remaining > 3 &&
      summary.days_remaining <= 7,
    message: ({ summary }) =>
      `Saldo tersisa untuk ~${summary.days_remaining} hari. Pertimbangkan kurangi pengeluaran.`,
    type: 'warning',
  },
  // 3. Budget kategori hampir habis (< 20%)
  {
    id: 'budget-almost-exhausted',
    check: ({ budgets }) =>
      budgets.some(b => b.percentage !== undefined && b.percentage >= 80 && b.amount > 0),
    message: ({ budgets }) => {
      const critical = budgets
        .filter(b => b.percentage !== undefined && b.percentage >= 80)
        .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))[0]
      return `Budget ${critical?.category?.name ?? 'kategori'} sudah terpakai ${Math.round(critical?.percentage ?? 0)}%.`
    },
    type: 'warning',
  },
  // 4. Pengeluaran hari ini lebih dari rata-rata harian
  {
    id: 'high-daily-spending',
    check: ({ summary }) =>
      summary.daily_burn_rate > 0 &&
      summary.expense_this_month / getDayOfMonth() > summary.daily_burn_rate * 1.3,
    message: ({ summary }) => {
      const today = Math.round(summary.expense_this_month / getDayOfMonth())
      return `Pengeluaran rata-rata hari ini Rp ${(today / 1000).toFixed(0)}k, lebih tinggi dari biasanya.`
    },
    type: 'warning',
  },
  // 5. Belum ada transaksi hari ini
  {
    id: 'no-transaction-today',
    check: ({ transactions }) => {
      const today = new Date().toDateString()
      return !transactions.some(t =>
        new Date(t.transaction_date).toDateString() === today
      )
    },
    message: () => `Belum ada transaksi hari ini. Jangan lupa catat pengeluaranmu!`,
    type: 'info',
  },
  // 6. Hemat! Spending < 70% dari biasanya
  {
    id: 'good-spending',
    check: ({ summary }) => {
      const daysIn = getDayOfMonth()
      const expectedSpend = summary.daily_burn_rate * daysIn
      return summary.expense_this_month < expectedSpend * 0.7 && summary.expense_this_month > 0
    },
    message: () => `🎉 Bagus! Pengeluaranmu bulan ini lebih hemat dari biasanya. Pertahankan!`,
    type: 'tip',
  },
  // 7. Saldo positif dan masih banyak hari tersisa
  {
    id: 'on-track',
    check: ({ summary }) =>
      summary.days_remaining !== null &&
      summary.days_remaining > getDaysLeftInMonth() &&
      summary.balance > 0,
    message: ({ summary }) =>
      `✅ Keuangan kamu on track! Saldo cukup untuk ${summary.days_remaining} hari ke depan.`,
    type: 'info',
  },
]

export function generateInsights(data: FinancialSnapshot): Omit<Insight, 'id' | 'user_id' | 'generated_at'>[] {
  return rules
    .filter(rule => rule.check(data))
    .map(rule => ({
      type: rule.type,
      message: rule.message(data),
      is_read: false,
      expires_at: null,
    }))
    .slice(0, 3) // Max 3 insights at a time
}

export function calculateFinancialSummary(
  transactions: Transaction[],
  monthlyIncome: number
): FinancialSummary {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const thisMonth = transactions.filter(t => new Date(t.transaction_date) >= startOfMonth)
  const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const balance = income - expense
  const daysIn = getDayOfMonth()
  const daysLeft = getDaysLeftInMonth()

  const dailyBurnRate = daysIn > 0 ? expense / daysIn : 0
  const daysRemaining = dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : null

  return {
    balance,
    income_this_month: income,
    expense_this_month: expense,
    daily_burn_rate: dailyBurnRate,
    days_remaining: daysRemaining,
    budget_remaining: null, // Computed separately with budget data
  }
}
