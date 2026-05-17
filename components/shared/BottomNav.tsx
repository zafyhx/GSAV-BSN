'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ArrowLeftRight, BarChart2, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home', id: 'tour-nav-home' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transaksi', id: 'tour-nav-transactions' },
  { href: '/analytics', icon: BarChart2, label: 'Analitik', id: 'tour-nav-analytics' },
  { href: '/budget', icon: Wallet, label: 'Budget', id: 'tour-nav-budget' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <div className="flex items-start justify-around h-full px-2 pt-2">
        {navItems.map(({ href, icon: Icon, label, id }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              id={id}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl transition-all duration-200',
                isActive
                  ? 'text-accent-green'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Icon
                className={cn('w-5 h-5 transition-all', isActive && 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]')}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={cn('text-[10px] font-medium tracking-wide', isActive && 'font-semibold')}>
                {label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-accent-green mt-0.5" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
