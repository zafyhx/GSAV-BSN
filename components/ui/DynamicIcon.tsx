import {
  Utensils, Car, Coffee, BookOpen, Gamepad2, Receipt, PiggyBank, Package,
  Wallet, GraduationCap, Briefcase, Gift, Banknote, ShoppingCart, Pill,
  Music, Dumbbell, Plane, Monitor, Smartphone, Heart, Home, Zap
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  Utensils, Car, Coffee, BookOpen, Gamepad2, Receipt, PiggyBank, Package,
  Wallet, GraduationCap, Briefcase, Gift, Banknote, ShoppingCart, Pill,
  Music, Dumbbell, Plane, Monitor, Smartphone, Heart, Home, Zap
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP)

interface DynamicIconProps {
  name: string
  className?: string
  style?: React.CSSProperties
}

export function DynamicIcon({ name, className, style }: DynamicIconProps) {
  const Icon = ICON_MAP[name] || Package
  return <Icon className={className} style={style} />
}
