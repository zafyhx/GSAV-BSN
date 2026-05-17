'use client'

import { BalanceCard, BurnRateWidget } from '@/components/dashboard/BalanceCard'
import { InsightBanner } from '@/components/dashboard/InsightBanner'
import { TransactionList } from '@/components/transactions/TransactionList'
import { QuickAddBar } from '@/components/transactions/QuickAddBar'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { useProfile } from '@/lib/hooks/useProfile'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: transactions = [], isLoading } = useTransactions(50)
  const { data: profile } = useProfile()

  const firstName = profile?.display_name?.split(' ')[0] ?? 'Kamu'
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'

  return (
    <div className="space-y-4 pt-2 pb-4">
      {/* Header */}
      <div className="sticky-header flex items-center justify-between pb-3 -mx-4 px-4 border-b border-white/5 mb-4 shadow-sm shadow-black/50">
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-0.5">
            {greeting}
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            {firstName}
          </h1>
        </div>
        <Link href="/settings">
          <div className="w-9 h-9 rounded-full bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
            <span className="text-sm font-semibold text-accent-purple">
              {firstName[0]?.toUpperCase()}
            </span>
          </div>
        </Link>
      </div>

      {/* Balance */}
      <BalanceCard />

      {/* Burn Rate */}
      <BurnRateWidget />

      {/* Insights */}
      <InsightBanner />

      {/* Quick Add */}
      <QuickAddBar />

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Transaksi Terbaru</h2>
          <Link href="/transactions" className="text-xs text-accent-green font-medium flex items-center gap-1">
            Lihat semua
            <TrendingUp className="w-3 h-3" />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : (
          <TransactionList transactions={transactions} limit={5} />
        )}
      </div>
    </div>
  )
}
