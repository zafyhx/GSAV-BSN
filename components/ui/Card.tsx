import { cn } from '@/lib/utils/cn'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'ghost'
}

export function Card({ children, className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        variant === 'default' && 'bg-bg-card border-border',
        variant === 'elevated' && 'bg-bg-elevated border-border-strong',
        variant === 'ghost' && 'bg-transparent border-transparent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
