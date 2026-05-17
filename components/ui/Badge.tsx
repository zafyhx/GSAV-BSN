import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export function Badge({ children, color = '#64748b', className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', className)}
      style={{ backgroundColor: `${color}22`, color }}
    >
      {children}
    </span>
  )
}

interface CategoryBadgeProps {
  icon: string
  name: string
  color: string
  className?: string
}

export function CategoryBadge({ icon, name, color, className }: CategoryBadgeProps) {
  return (
    <Badge color={color} className={className}>
      <span>{icon}</span>
      <span>{name}</span>
    </Badge>
  )
}
