import { Category } from '@/types'

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at' | 'is_default'>[] = [
  { name: 'Makan', icon: 'Utensils', color: '#f97316' },
  { name: 'Transport', icon: 'Car', color: '#3b82f6' },
  { name: 'Nongkrong', icon: 'Coffee', color: '#a855f7' },
  { name: 'Akademik', icon: 'BookOpen', color: '#22c55e' },
  { name: 'Hiburan', icon: 'Gamepad2', color: '#ec4899' },
  { name: 'Tagihan', icon: 'Zap', color: '#eab308' },
  { name: 'Tabungan', icon: 'PiggyBank', color: '#14b8a6' },
  { name: 'Lainnya', icon: 'Package', color: '#64748b' },
]

export const INCOME_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at' | 'is_default'>[] = [
  { name: 'Uang Bulanan', icon: 'Wallet', color: '#22c55e' },
  { name: 'Beasiswa', icon: 'GraduationCap', color: '#3b82f6' },
  { name: 'Freelance', icon: 'Briefcase', color: '#a855f7' },
  { name: 'Hadiah', icon: 'Gift', color: '#f97316' },
  { name: 'Lainnya', icon: 'Banknote', color: '#64748b' },
]

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
