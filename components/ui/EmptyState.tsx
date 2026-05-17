import { cn } from '@/lib/utils/cn'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-bg-card border border-border rounded-2xl border-dashed', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-bg-surface border border-border flex items-center justify-center text-text-muted mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && <p className="text-sm text-text-secondary mt-1 max-w-[200px] mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
