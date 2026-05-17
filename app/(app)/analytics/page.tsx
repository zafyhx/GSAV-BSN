'use client'

import { useTransactionsByMonth } from '@/lib/hooks/useTransactions'
import { useCategories } from '@/lib/hooks/useCategories'
import { formatCurrencyCompact } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/date'
import { MONTH_NAMES } from '@/lib/constants/categories'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { eachDayOfInterval, startOfMonth, endOfMonth, format, parseISO } from 'date-fns'
import { BarChart2 } from 'lucide-react'

export default function AnalyticsPage() {
  const now = new Date()
  const { data: transactions = [], isLoading } = useTransactionsByMonth(now.getFullYear(), now.getMonth() + 1)
  const { data: categories = [] } = useCategories()

  const expenses = transactions.filter(t => t.type === 'expense')
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)

  // Category breakdown
  const categorySpending = categories
    .map(cat => {
      const total = expenses
        .filter(t => t.category_id === cat.id)
        .reduce((s, t) => s + t.amount, 0)
      return { category: cat, total, percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0 }
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  // Daily spending for bar chart
  const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) })
  const dailyData = days.map(day => {
    const key = format(day, 'yyyy-MM-dd')
    const total = expenses
      .filter(t => format(parseISO(t.transaction_date), 'yyyy-MM-dd') === key)
      .reduce((s, t) => s + t.amount, 0)
    return { date: format(day, 'd'), total }
  }).filter(d => d.total > 0 || parseInt(d.date) <= now.getDate())

  const avgDaily = now.getDate() > 0 ? totalExpense / now.getDate() : 0

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
      </div>
    )
  }

  if (!expenses.length) {
    return (
      <div id="tour-chart-analytics" className="pt-4">
        <h1 className="text-xl font-bold text-text-primary mb-6">Analitik</h1>
        <EmptyState icon={BarChart2} title="Belum ada data" description="Tambah transaksi untuk melihat analitik pengeluaranmu" />
      </div>
    )
  }

  return (
    <div id="tour-chart-analytics" className="space-y-5 pt-2 pb-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-text-primary">Analitik</h1>
        <p className="text-xs text-text-muted mt-0.5">{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-text-muted mb-1">Total Pengeluaran</p>
          <p className="text-xl font-bold text-text-primary mono-number">{formatCurrencyCompact(totalExpense)}</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted mb-1">Rata-rata/Hari</p>
          <p className="text-xl font-bold text-text-primary mono-number">{formatCurrencyCompact(avgDaily)}</p>
        </Card>
      </div>

      {/* Daily Bar Chart */}
      <Card>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Pengeluaran Harian</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={dailyData} barSize={6}>
            <XAxis
              dataKey="date"
              tick={{ fill: '#555', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#888' }}
              formatter={(value: number) => [formatCurrencyCompact(value), 'Pengeluaran']}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Category breakdown */}
      <Card>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Per Kategori</p>

        {/* Donut */}
        <div className="flex items-center gap-4 mb-5">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={categorySpending}
                dataKey="total"
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={48}
                paddingAngle={2}
              >
                {categorySpending.map((entry, i) => (
                  <Cell key={i} fill={entry.category.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-1.5">
            {categorySpending.slice(0, 4).map(({ category, percentage }) => (
              <div key={category.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                <span className="text-xs text-text-secondary flex-1 truncate">{category.name}</span>
                <span className="text-xs font-medium text-text-primary">{Math.round(percentage)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar list */}
        <div className="space-y-3">
          {categorySpending.map(({ category, total, percentage }) => (
            <div key={category.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <DynamicIcon name={category.icon} className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm text-text-primary">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-text-primary mono-number">
                    {formatCurrencyCompact(total)}
                  </span>
                  <span className="text-xs text-text-muted ml-1">({Math.round(percentage)}%)</span>
                </div>
              </div>
              <ProgressBar value={percentage} color={category.color} />
            </div>
          ))}
        </div>
      </Card>

      {/* Top category badge */}
      {categorySpending[0] && (
        <Card variant="elevated" className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-bg-surface border border-border" style={{ color: categorySpending[0].category.color }}>
            <DynamicIcon name={categorySpending[0].category.icon} className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Paling boros bulan ini</p>
            <p className="text-sm font-semibold text-text-primary">{categorySpending[0].category.name}</p>
            <p className="text-xs text-text-secondary">{Math.round(categorySpending[0].percentage)}% dari total pengeluaran</p>
          </div>
        </Card>
      )}
    </div>
  )
}
